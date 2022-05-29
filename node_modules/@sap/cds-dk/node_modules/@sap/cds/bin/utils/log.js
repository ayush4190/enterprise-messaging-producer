const { sortMessagesSeverityAware, deduplicateMessages } = require('@sap/cds-compiler')

// sorts, filters, and writes compilation messages to console
module.exports = (messages, options={}) => {
  const { format } = require('./term')
  const level = _effectiveLogLevel (options)
  const log = options.log || console.error

  if (!Array.isArray (messages))  messages = [messages]
  messages.forEach (m => { if (!m.severity)  m.severity = 'Error' })
  messages = messages.filter (m => level.includes (m.severity))

  deduplicateMessages(messages)
  messages = sortMessagesSeverityAware (messages)

  for (let m of messages) {
    // show stack for resolution issues since there the requiring code location is in the stack
    const internalError = isInternalError(m)
    const withStack = options.withStack || m.code === 'MODULE_NOT_FOUND' || internalError
    const mf = format (m, m.severity, internalError, withStack)
    log (mf)
  }
}

function _effectiveLogLevel (options) {
  const logLevel = options && options['log-level'] || require('../../lib').env.log.levels.cli
  if (/^debug$/i.test (logLevel))  return ['Error', 'Warning', 'Info', 'Debug']
  else if (/^info$/i.test (logLevel))  return ['Error', 'Warning', 'Info']
  else if (/^warn/i.test (logLevel))  return ['Error', 'Warning']
  else if (/^error/i.test (logLevel))  return ['Error']
  else return ['Error', 'Warning']
}

function isInternalError(e) {
  // check for standard Error classes, but not Error itself
  return e.name === 'EvalError' || e.name === 'InternalError' || e.name === 'RangeError'
    || e.name === 'ReferenceError' || e.name === 'SyntaxError' || e.name === 'TypeError'
    || e.name === 'URIError'
}

/* eslint no-console:off */
