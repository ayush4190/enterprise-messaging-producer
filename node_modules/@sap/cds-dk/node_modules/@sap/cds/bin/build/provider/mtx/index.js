/* eslint-disable no-empty */
const { fs } = require('@sap/cds-foss')
const path = require('path')
const { BUILD_TASK_HANA, FOLDER_GEN } = require('../../constants')
const { WARNING } = require('../../buildTaskHandler')
const BuildTaskProviderInternal = require("../buildTaskProviderInternal")
const BuildTaskHandlerEdmx = require('../buildTaskHandlerEdmx')

const FOLDER_SDC = "sdc"
const FOLDER_NODE_MODULES = "node_modules"
const FOLDER_TEMPLATES = "tpl"

class MtxModuleBuilder extends BuildTaskHandlerEdmx {
    get priority() {
        // should be scheduled after all other build tasks are finished
        return BuildTaskHandlerEdmx.PRIORITY_MIN_VALUE
    }
    init() {
        super.init()
        if (this.buildOptions.root === this.buildOptions.target) {
            this.task.dest = path.join(this.task.dest, FOLDER_GEN, FOLDER_SDC)
        } else {
            this.task.dest = path.join(this.task.dest, FOLDER_SDC)
        }
    }
    async build() {
        const model = await this.model()
        if (!model) {
            return
        }

        // custom build tasks for srv and db modules might be defined
        const tenantDbPath = await this._getHanaTenantDbPath()

        // validate extension whitlists defined for this SaaS application
        this._validateExtensionAllowLists(model, tenantDbPath)

        // copy base model sources
        await Promise.all(model.$sources.map(src => {
            if (src.includes(FOLDER_NODE_MODULES)) {
                return this.copy(src).to(src.substr(src.indexOf(FOLDER_NODE_MODULES)))
            } else {
                const relSrc = path.relative(this.buildOptions.root, src)
                if (relSrc.startsWith("..")) {
                    this.logger.warn(`model file is out of project scope, skipping file ${src}`)
                    return Promise.resolve()
                }
                return this.copy(src).to(relSrc)
            }
        }))

        // collect and write language bundles into single i18n.json file
        await this.collectLanguageBundles(model, this.task.dest)

        // copy native hana content and templates
        await this._copyNativeContent(this.task.src, this.task.dest, tenantDbPath)
    }

    async clean() {
        // staging build content is deleted by BuildTaskEngine
        if (this.buildOptions.root === this.buildOptions.target) {
            // delete entire folder 'gen'
            const genDest = path.dirname(this.task.dest)
            if (path.basename(genDest) === FOLDER_GEN) {
                this.logger._debug && this.logger.debug(`Deleting build target folder ${genDest}`)
                await fs.remove(genDest)
            }
        }
    }

    async _copyNativeContent(src, dest, tenantDbPath) {
        // copying tmplates
        const tplSrc = path.join(src, FOLDER_TEMPLATES)
        if (fs.existsSync(tplSrc)) {
            const tplDest = path.join(path.dirname(dest), FOLDER_TEMPLATES)
            await this._copyTemplates(tplSrc, tplDest)
        }

        if (tenantDbPath) {
            // copy any static HANA artifacts, e.g. .csv files
            const dbDest = path.resolve(dest, path.relative(this.buildOptions.root, tenantDbPath))
            await this._copyNativeHanaContent(tenantDbPath, dbDest)
        }
    }

    async _copyNativeHanaContent(src, dest) {
        return super.copyNativeContent(src, dest, (entry) => {
            if (fs.statSync(entry).isDirectory()) {
                const folderName = path.basename(entry)
                return folderName !== FOLDER_NODE_MODULES
            }
            // also add table data properties files containing translated texts
            return /\.csv$|\.hdb.*$|^\.hdi.*|\.properties$|^undeploy\.json/.test(path.basename(entry))
        })
    }

    async _copyTemplates(src, dest) {
        return super.copyNativeContent(src, dest, (entry) => {
            if (fs.statSync(entry).isFile()) {
                return /\.cds$/.test(path.basename(entry))
            }
            return true
        })
    }

    /**
     * Extensions shall be restricted to relevant entities, by default all entities and services can be extended.
     * Empty whitelists indicate that all services or entities can be extended.
     * <br>
     * A warning is logged in case neither a 'entity-whitelist' nor a o service-whitelist has been defined.
     * An error is thrown in case a invalid entry is found.
     *
     * @param {Object} model - the reflected csn for this SaaS application
     */
    _validateExtensionAllowLists(model, tenantDbPath) {
        let entityWhitelist = this.env.get("mtx.entity-whitelist")
        let serviceWhitelist = this.env.get("mtx.service-whitelist")
        let extensionAllowlist = this.env.get("mtx.extension-allowlist")

        // for java projects mtx configuration is part of sidecar config
        if (!entityWhitelist && !serviceWhitelist && !extensionAllowlist && tenantDbPath) {
            const dbEnv = this.env.for("cds", tenantDbPath)
            if (dbEnv && dbEnv.get("mtx")) {
                entityWhitelist = dbEnv.get("mtx.entity-whitelist")
                serviceWhitelist = dbEnv.get("mtx.service-whitelist")
                extensionAllowlist = dbEnv.get("mtx.extension-allowlist")
            }
        }

        if (extensionAllowlist || entityWhitelist || serviceWhitelist) {
            const invalidEntries = new Set()
            const reflected = this.cds.reflect(model)
            const services = reflected.services
            const entities = Object.values(reflected.entities)

            if (Array.isArray(extensionAllowlist)) {
                extensionAllowlist.forEach(allowListEntry => {
                    if (Array.isArray(allowListEntry.for)) {
                        allowListEntry.for.forEach(pattern => {
                            if (pattern !== '*') {
                                const nsPattern = pattern + '.'
                                if (allowListEntry.kind === 'service') {
                                    if (!services.some(service => service.name === pattern || service.name.startsWith(nsPattern))) {
                                        invalidEntries.add(pattern)
                                    }
                                } else {
                                    if (!entities.some(entity => entity.name === pattern || entity.name.startsWith(nsPattern))) {
                                        invalidEntries.add(pattern)
                                    }
                                }
                            }
                        })
                    }
                })
                if (invalidEntries.size > 0) {
                    this.pushMessage(`Invalid entries found in 'extension-allowlist' - [${[...invalidEntries].join(', ')}]`, WARNING)
                }
            } else if (Array.isArray(entityWhitelist) || Array.isArray(serviceWhitelist)) {
                // validate whitelist entries
                if (Array.isArray(entityWhitelist)) {
                    entityWhitelist.forEach(name => {
                        if (!entities.some(entity => entity.name === name && entity.kind === 'entity')) {
                            invalidEntries.add(name)
                        }
                    })
                }
                if (Array.isArray(serviceWhitelist)) {
                    serviceWhitelist.forEach(name => {
                        if (!services.some(service => service.name === name && service.kind === 'service')) {
                            invalidEntries.add(name)
                        }
                    })
                }
                if (invalidEntries.size > 0) {
                    this.pushMessage(`Invalid entries found in 'entity-whitelist' or 'service-whitelist' - [${[...invalidEntries].join(', ')}]`, WARNING) //NOSONAR
                }
            }
        }
    }

    /**
     * Returns the build tasks of this project - either user defined or calculated by BuildTaskFactory.
     * A build task of type 'hana' is enforced in order to copy existing native hana artifacts later on.
     *
     * @returns {string} the src folder of the tenant db module
     */
    async _getHanaTenantDbPath() {
        let tasks = this.buildOptions.tasks || []
        const modelPaths = this.resolveModel()

        // ensure that the hana task is contained even if this mtx task has been executed solely using "cds build --for mtx"
        if (!tasks.find(task => task.for === BUILD_TASK_HANA)) {
            //mtx task might have been executed as separate task
            tasks = this.env.get("build.tasks") || []
            if (tasks.length === 0) {
                const provider = new BuildTaskProviderInternal(this.cds, this.logger)
                tasks = await provider.lookupTasks(this.buildOptions)
            }
        }
        // the SaaS app might use a tenant aware db as well as a shared db deployed using static hdi-deployer
        // pick the hana build task refering to the tenant aware db - the src path has to be contained in this build task's model options
        const hanaDbPaths = tasks.filter(task => task.for === BUILD_TASK_HANA).map(hanaTask => path.resolve(this.buildOptions.root, hanaTask.src || this.env.folders.db))
        let tenantDbPath = hanaDbPaths.find(hanaDbPath => hanaDbPaths.length === 1 || modelPaths.some(modelPath => path.dirname(modelPath) === hanaDbPath))

        if (!tenantDbPath) {
            tenantDbPath = path.join(this.buildOptions.root, this.env.folders.db)
            if (hanaDbPaths.length === 0) {
                this.pushMessage(`no 'hana' build task found, use default location '${tenantDbPath}'`, WARNING)
            } else {
                this.pushMessage(`no 'hana' build task found matching model scope '${this.task.options.model}', use default location '${tenantDbPath}'`, WARNING)
            }
        }
        return tenantDbPath
    }
}
module.exports = MtxModuleBuilder
