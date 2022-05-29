const { fs } = require('@sap/cds-foss')
const path = require('path')
const { SEVERITY_ERROR } = require('./constants')

function getProperty(src, segments) {
    segments = Array.isArray(segments) ? segments : segments.split('.')
    return segments.reduce((p, n) => p && p[n], src)
}

function setProperty(src, segments, value) {
    segments = Array.isArray(segments) ? segments : segments.split('.')
    segments.reduce((p, n, idx) => {
        if (segments.length === idx + 1) {
            p[n] = value
        } else {
            if (p[n] === undefined) {
                p[n] = {}
            }
        }
        return p[n]
    }, src)
}

/**
 * Returns an array of pom.xml file paths found in the given directories.
 * @param {Array} dirs - the absolute path names to check.
 */
function readPomFilePaths(dirs) {
    return dirs.reduce((acc, dir) => {
        const file = path.join(dir, 'pom.xml')
        if (fs.existsSync(file)) {
            acc.push(file)
        }
        return acc
    }, [])
}

/**
 * Returns whether this project is a java project or not.
 * @param {Array} dirs - the absolute path names to check.
 */
function hasJavaNature(dirs) {
    return readPomFilePaths(dirs).length > 0
}

/**
 * Determines wheter the both values are identical.
 * @param {*} actual
 * @param {*} expected
 */
function hasOptionValue(actual, expected) {
    if (typeof expected === 'undefined') {
        return actual !== undefined
    }
    if (typeof actual === 'undefined') {
        return false
    }
    if (typeof expected === 'boolean') {
        if (typeof actual === 'string') {
            return String(expected) === actual
        }
    }
    return actual === expected
}

// Returning the project relative path representation of the given path(s),
function relativePaths(root, qualifiedPaths) {
    qualifiedPaths = typeof qualifiedPaths === "string" ? [qualifiedPaths] : qualifiedPaths
    if (Array.isArray(qualifiedPaths)) {
        return qualifiedPaths.map(qualifiedPath => {
            const relPath = path.relative(root, qualifiedPath)
            return relPath || "."
        })
    }
    return qualifiedPaths
}

/**
 * Returns <code>true</code> if this project is an old java service-sdk project,
 * <code>false</code> if it is a java-NG project or if no pom.xml has been found.
 * @param {Array} dirs - the absolute path names to check.
 */
async function isOldJavaStack(dirs) {
    const files = readPomFilePaths(dirs)
    if (files.length > 0) {
        return (await Promise.all(files.map(async file => {
            const content = await fs.readFile(file, 'utf-8')
            return content && /<groupId>\s*com\.sap\.cloud\.servicesdk/.test(content) && !(/<groupId>\s*com\.sap\.cds\s*<\/groupId>/.test(content) && /<artifactId>\s*cds-/.test(content))
        }))).some(result => result)
    }
    return false
}

/**
 * Returns a promise that resolves after all of the given promises have either resolved or rejected,
 * with an array of objects that each describes the outcome of each promise.
 *
 * @param {*} promises An iterable object, such as an Array, in which each member is a Promise.
 * @returns A pending Promise that will be asynchronously fulfilled once every promise in the specified
 * collection of promises has completed, either by successfully being fulfilled or by being rejected.
 * At that time, the returned promise's handler is passed as input an array containing the outcome of
 * each promise in the original set of promises.<br>
 * For each outcome object, a status string is present. If the status is fulfilled, then a value is present.
 * If the status is rejected, then a reason is present. The value (or reason) reflects what value each
 * promise was fulfilled (or rejected) with.
 */
function allSettled(promises) {
    let wrappedPromises = Array.from(promises).map(p =>
        Promise.resolve(p).then(
            val => ({ state: 'fulfilled', value: val }),
            err => ({ state: 'rejected', reason: err })
        )
    );
    return Promise.all(wrappedPromises);
}

function redactCredentials(config, o) {
    return JSON.stringify(config, (k, v) => {
        if (!v) {
            return v
        }
        if (k === 'credentials') {
            try {
                return _redacted(v)
            } catch (e) {/* ignored */ }
        }
        return v
    }, o && o.indents || 2)
}

function isAbsolutePath(pathName) {
    return /^(?:\/|[a-z]+:\/\/)/.test(pathName)
}

/** redacts password-like strings, also reducing clutter in output */
function _redacted(cred) {
    const secrets = /(password)|(certificate)|(ca)/i // 'certificate' and 'ca' on HANA
    const newCred = Object.assign({}, cred)
    Object.keys(newCred)
        .filter(k => typeof newCred[k] === 'string' && secrets.test(k))
        .forEach(k => newCred[k] = '...')
    return newCred
}

class BuildMessage extends Error {
    constructor(message, severity) {
        super(message)
        this.name = "BuildMessage"
        this.severity = severity
    }
    toString() {
        return this.severity + ": " + this.message
    }
}

class BuildError extends BuildMessage {
    constructor(message, messages = []) {
        super(message, SEVERITY_ERROR)
        this.name = "BuildError"
        this.messages = messages
    }

    // for compatibility reasons
    get errors() {
        return this.messages
    }

    toString() {
        return this.message + '\n' + this.messages.map(m => m.toString()).join('\n')
    }
}

module.exports = {
    getProperty,
    setProperty,
    hasJavaNature,
    isOldJavaStack,
    allSettled,
    redactCredentials,
    hasOptionValue,
    relativePaths,
    isAbsolutePath,
    BuildMessage,
    BuildError
}
