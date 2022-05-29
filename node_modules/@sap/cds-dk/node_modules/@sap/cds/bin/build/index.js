const path = require('path')
const { fs } = require('@sap/cds-foss')
const BuildTaskEngine = require('./buildTaskEngine')
const BuildTaskFactory = require('./buildTaskFactory')
const BuildTaskHandler = require('./buildTaskHandler')
const { LOG_MODULE_NAMES } = require('./constants')
const { BuildError } = require('./util')
const { BUILD_MODE_INPLACE } = require('./constants')

module.exports = Object.assign(build,
    { build, BuildTaskFactory, BuildTaskEngine, BuildTaskHandler, BuildError }
)

/**
 * New modular build.
 *
 * @param {object} options - commmand options as defined by build command.
 * @param {object} _env - for testing purposes only, will be removed.
 */
async function build(options = {}, _env = null /* for unit tests only: */) {
    const projectPath = path.resolve(options.project || '.')

    if (!fs.lstatSync(projectPath).isDirectory()) {
        return Promise.reject(`Project [${projectPath}] does not exist`)
    }

    const cds = require('./cds').in(projectPath)
    const logger = options.logger || cds.log(LOG_MODULE_NAMES)

    if (_env) {
        // REVISIT: please avoid using internal APIs
        cds.env = cds.env._merge_with(_env)
    }

    const buildOptions = _mergeOptions({ root: projectPath }, options)

    // Webide Fullstack compatibility mode
    if (cds.env.build.mode === BUILD_MODE_INPLACE) {
        cds.env.build.target = "."
    }
    let tasks = await new BuildTaskFactory(logger, cds).getTasks(buildOptions)
    return new BuildTaskEngine(logger, cds).processTasks(tasks, buildOptions)
}

function _mergeOptions(buildOptions, options) {
    buildOptions["log-level"] = options["log-level"]
    buildOptions.cli = options.cli
    buildOptions.cmdOptions = options
    return buildOptions
}
