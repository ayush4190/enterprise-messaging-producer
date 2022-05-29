/**
 * Messages Collector, used for `req.errors` and `req.messages`
 */
class Responses extends Array {
  add (severity, code, message, target, args) { // NOSONAR
    let e // be filled in below...
    if (typeof code === 'object') e = code; else {
      if (typeof code === 'number') e = { code }; else [ code, message, target, args, e ] = [ undefined, code, message, target, {} ]
      if (typeof message === 'object') e = Object.assign(message,e); else {
        if (typeof target === 'object') [ target, args ] = [ undefined, target ]
        if (message) e.message = message //; else if (code) e.message = String(code)
        if (target) e.target = target
        if (args) e.args = args
      }
    }
    if (!e.numericSeverity) e.numericSeverity = severity
    this.push(e)
    return e
  }
}

class Errors extends Responses {
  throwable() {
    return this.length === 1 ? this[0] : { message: 'MULTIPLE_ERRORS', details:this }
  }
}

module.exports = { Responses, Errors }
