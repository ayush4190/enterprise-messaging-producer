const { fs } = require('@sap/cds-foss')
const path = require('path')
const _cds = require('./cds'), { log } = _cds.exec
const BuildTaskProviderFactory = require('./buildTaskProviderFactory')
const { sortMessagesSeverityAware, deduplicateMessages, CompilationError } = require('@sap/cds-compiler')
const { allSettled, relativePaths, BuildError, BuildMessage } = require('./util')
const { OUTPUT_MODE_DEFAULT, SEVERITIES, LOG_LEVELS, LOG_MODULE_NAMES } = require('./constants')
const BuildTaskHandlerInternal = require('./provider/buildTaskHandlerInternal')

const COMPILATION_ERROR = 'CompilationError'
const COMPILE_MESSAGE = 'CompileMessage'

class BuildTaskEngine {
    constructor(logger, cds) {
        this._cds = cds ? cds : _cds
        this._logger = logger || this._cds.log(LOG_MODULE_NAMES)
    }

    get cds() {
        return this._cds
    }
    get env() {
        return this._cds.env
    }
    get logger() {
        return this._logger
    }

    async processTasks(tasks, buildOptions, clean = true) {
        const handlers = []
        const startTime = Date.now()

        if (buildOptions) {
            // clone as data may be stored as part of the buildOptions object
            buildOptions = JSON.parse(JSON.stringify(buildOptions))
        } else {
            buildOptions = {
                root: process.env._TEST_CWD || process.cwd()
            }
        }
        if (!buildOptions.outputMode) {
            buildOptions.outputMode = OUTPUT_MODE_DEFAULT
        }

        this.logger.log(`building project [${buildOptions.root}], clean [${clean}]`)
        this.logger.log(`cds [${_cds.version}], compiler [${require('@sap/cds-compiler/package.json').version}], home [${_cds.home}]\n`)

        if (!buildOptions.target) {
            buildOptions.target = path.resolve(buildOptions.root, this.env.build.target)
        }

        tasks.forEach((task) => {
            if (task) {
                const handler = this._createHandler(task, buildOptions)
                handlers.push(handler)
            }
        })

        // use resolved tasks
        buildOptions.tasks = handlers.map(handler => handler.task)

        try {
            await this._executePrepare(handlers, buildOptions)
            await this._executeCleanBuildTasks(handlers, buildOptions, clean)
            const buildResult = await this._executeBuildTasks(handlers, buildOptions)
            await this._logBuildOutput(handlers, buildOptions)
            this._logMessages(buildOptions, BuildTaskEngine._getHandlerMessages(handlers))
            this._logTimer(startTime, Date.now())

            return buildResult
        } catch (error) {
            await this._logBuildOutput(handlers, buildOptions, false)
            // cds CLI layer is doing the logging if invoked using CLI
            if (!buildOptions.cli) {
                this._logMessages(buildOptions, BuildTaskEngine._getErrorMessages([error]))
            }

            if (error.name === BuildError.name && error.errors.length > 0 && error.errors[0].constructor.name === COMPILATION_ERROR) {
                // TODO: for compatibility reasons with cds-mtx we're throwing the actual cause of type CompiliationError
                // Note: As a consequence we are loosing any info or warning messages issued by build task handlers
                throw error.errors[0]
            }
            throw error
        }
    }

    /**
     * BuildTaskHandler#prepare has been deprecated and was never part of the public API.
     * Currently only used by internal FioriBuildTaskHandller.
     * @deprecated
     * @param {*} handlers
     * @returns
     */
    async _executePrepare(handlers, buildOptions) {
        const handlerGroups = new Map()

        // group handlers by type
        handlers.forEach(handler => {
            handlerGroups.has(handler.task.for) ? handlerGroups.get(handler.task.for).push(handler) : handlerGroups.set(handler.task.for, [handler])
        })

        const promises = []
        for (let handlerGroup of handlerGroups.values()) {
            promises.push(this._doPrepare(handlerGroup, buildOptions))
        }
        return Promise.all(promises)
    }

    /**
     * @deprecated
     * @param {*} handlerGroup 
     */
    async _doPrepare(handlerGroup, buildOptions) {
        for (let handler of handlerGroup) {
            // prepare has been deprecated
            if (handler instanceof BuildTaskHandlerInternal) {
                this.logger._debug && this.logger.debug(`preparing, handler [${handler.constructor.name}], src [${relativePaths(buildOptions.root, handler.task.src)}]`)
                const result = await handler.prepare()
                if (result === false) {
                    break
                }
            }
        }
    }

    async _executeCleanBuildTasks(handlers, buildOptions, clean) {
        if (clean) {
            // clean entire build staging folder once
            if (buildOptions.target !== buildOptions.root) {
                this.logger._debug && this.logger.debug(`cleaning staging folder ${buildOptions.target}`)
                await fs.remove(buildOptions.target)
            }

            const results = await allSettled(handlers.map((handler) => {
                this.logger._debug && this.logger.debug(`cleaning, handler [${handler.constructor.name}], src [${relativePaths(buildOptions.root, handler.task.src)}]`)
                return handler.clean()
            }))
            // check for errors and throw exception
            this._resolveHandlerResponse(results, buildOptions)
        }
    }

    async _executeBuildTasks(handlers, buildOptions) {
        // sort handlers based on priority in
        handlers = handlers.sort((a, b) => {
            return a.priority === b.priority ? 0 : a.priority > b.priority ? -1 : 1
        })
        // group handlers with same priority in order to execute in parallel
        const buildPipeline = handlers.reduce((acc, handler) => {
            if (acc.length === 0) {
                acc.push([handler])
            } else {
                const currGroup = acc[acc.length - 1]
                if (currGroup[0].priority === handler.priority) {
                    currGroup.push(handler)
                } else {
                    acc.push([handler])
                }
            }
            return acc
        }, [])

        const results = await this._executePipeline(buildOptions, buildPipeline)

        // check for errors and throw exception - return results otherwise including any compiler and build status messages
        return this._resolveHandlerResponse(results, buildOptions, BuildTaskEngine._getHandlerMessages(handlers))
    }

    async _executePipeline(buildOptions, pipeline) {
        let allResults = []
        for (const group of pipeline) {
            const results = await allSettled(group.map((handler) => {
                this.logger._debug && this.logger.debug(`building, handler [${handler.constructor.name}], src [${relativePaths(buildOptions.root, handler.task.src)}]`)
                return handler.build()
                    .then(handlerResult => {
                        return Promise.resolve({
                            task: handler.task,
                            result: handlerResult,
                            messages: this._sortCompilationErrorsUnique(buildOptions, handler.messages)
                        })
                    })
            }))
            allResults = allResults.concat(results)
        }
        return allResults
    }

    _resolveHandlerResponse(results, buildOptions, handlerMessages = []) {
        const errors = []
        const resolvedResults = results.reduce((acc, r) => {
            if (r.state === 'fulfilled') {
                acc.push(r.value)
            }
            if (r.state === 'rejected' && r.reason) {
                errors.push(r.reason)
            }
            return acc
        }, [])

        if (errors.length > 0) {
            const internalError = errors.find(e => e.constructor.name !== COMPILATION_ERROR && e.name !== BuildError.name)
            if (internalError) {
                throw internalError
            }
            const compileErrors = errors.filter(e => e.constructor.name === COMPILATION_ERROR)
            let buildErrors = []
            // NOTE: The order is important for now as for compatibility reasons the origin CompilationError
            // is thrown in processTasks method.
            // 1. compiler warnings are returned as handler messages
            const compileMessages = handlerMessages.filter(message => message.constructor.name === COMPILE_MESSAGE)
            if (compileErrors.length > 0) {
                const compileError = new CompilationError(this._sortCompilationErrorsUnique(buildOptions, BuildTaskEngine._getErrorMessages(compileErrors), compileMessages))
                buildErrors.push(compileError)
            }

            // 2. add other build errors
            buildErrors = buildErrors.concat(errors.filter(e => e.name === BuildError.name))

            // 3. add messages from build tasks
            buildErrors = buildErrors.concat(handlerMessages.filter(message => message.name === BuildMessage.name))

            throw new BuildError(`CDS build failed for [${buildOptions.root}]`, buildErrors)
        }
        return resolvedResults
    }

    _createHandler(task, buildOptions) {
        try {
            const providerFactory = new BuildTaskProviderFactory(this._logger, this._cds, buildOptions)
            const handler = providerFactory.createHandler(task)
            handler.init()

            if (!(handler instanceof BuildTaskHandlerInternal) && handler.priority !== 1) {
                // Custom build handlers are executed before internal handlers to ensure
                // that generated content cannot be overwriten by mistake
                throw new Error(`Illegal priority for ${handler.consructor.name} encountered for custom handler - in this version only priority value '1' is allowed`)
            }
            this._logTaskHandler(handler, buildOptions)

            return handler
        } catch (error) {
            log(error, { log: this.logger.log })
            throw error
        }
    }

    _getBuildOutput(handlers, buildOptions) {
        const files = handlers.reduce((acc, handler) => acc.concat(handler.files), []).sort()
        return files.map(file => path.relative(buildOptions.root, file))
    }

    async _logBuildOutput(handlers, buildOptions, writeOutputFile = true) {
        // log all generated files
        const files = this._getBuildOutput(handlers, buildOptions)
        if (files.length > 0) {
            this.logger.log(`done > wrote output to:\n   ${files.join("\n   ")}\n`)
        } else {
            this.logger.log('done >')
        }

        if (writeOutputFile) {
            const outputFile = this.env.build.outputfile || process.env.GENERATION_LOG
            if (outputFile) {
                this.logger.log(`writing generation log to [${outputFile}]\n`)
                await fs.outputFile(outputFile, files.join('\n'))
                    .catch((error) => {
                        this.logger.error(`failed to write generation log`)
                        this.logger.error(error.stack || error)
                        return Promise.resolve()
                    })
            }
        }
    }

    _logTimer(start, end) {
        this.logger.log(`build completed in ${end - start} ms\n`)
    }

    _logTaskHandler(handler, buildOptions) {
        this.logger._debug && this.logger.debug(`handler ${handler.constructor.name}`)
        this.logger._debug && this.logger.debug(`details src [${relativePaths(buildOptions.root, handler.task.src)}], dest [${relativePaths(buildOptions.root, handler.task.dest)}], use [${handler.task.use}], options [${JSON.stringify(handler.task.options)}]`) //NOSONAR
    }

    _logMessages(buildOptions, messages) {
        if (messages && messages.length > 0) {
            const options = {
                log: this.logger.log,
                "log-level": this._getLogLevel(buildOptions) // ensures that for tests the correct cds.env is used
            }
            log(messages, options)
        }
    }

    /**
     * Returns a sorted and flatend list of all messages extracted from the given errors.
     * @param {Array<Error>} errors
     */
    static _getErrorMessages(errors) {
        let messages = []
        // flatten all compile messages in order to filter duplicates and sort later on
        errors.forEach(error => {
            if (Array.isArray(error.errors) && error.errors.length > 0) {
                messages = messages.concat(BuildTaskEngine._getErrorMessages(error.errors))
            } else {
                messages.push(error)
            }
        })
        return messages
    }

    /**
     * Returns compiler messages and validation messages issued by handlers.
     * @param {Array<BuildTaskHandler>} handlers
     */
    static _getHandlerMessages(handlers) {
        return handlers.reduce((acc, handler) => acc.concat(handler.messages), [])
    }

    /**
     * Sort and filter the given errors of type CompileMessage or BuildMessage according to their severity and location,
     * but leave any other errors untouched as part of the result array.<br>
     * The log level passed as 'buildOptions.log-level' or defined in 'cds.env' is used to filter the given messages.
     * @param {object} buildOptions
     * @param  {...Error} messages
     */
    _sortCompilationErrorsUnique(buildOptions, ...messages) {
        const logLevelIdx = LOG_LEVELS.indexOf(this._getLogLevel(buildOptions))
        // flatten
        messages = messages.reduce((acc, m) => acc.concat(m), [])
        // filter according to log-level
        const filteredMessages = messages.filter(message => !message.severity || logLevelIdx >= SEVERITIES.indexOf(message.severity))
        // remove duplicates
        deduplicateMessages(filteredMessages)
        // sort
        return sortMessagesSeverityAware(filteredMessages)
    }

    /**
     * Return user defined log level or default value 'warn'
     * @param {string} buildOptions
     */
    _getLogLevel(buildOptions) {
        return buildOptions["log-level"] || this.env["log-level"]
    }
}
module.exports = BuildTaskEngine
