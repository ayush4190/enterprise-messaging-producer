const cds = require('..'), {expected} = cds.error

class EventHandlers {

  constructor (name) {
    this._handlers = { _initial:[], before:[], on:[], after:[], _error:[] }
    this.name = name
  }

  before (...args) { return _register (this, 'before', ...args) }
  on     (...args) { return _register (this, 'on',     ...args) }
  after  (...args) { return _register (this, 'after',  ...args) }
  reject (e, path) { return _register (this, '_initial', e, path,
    (r) => r.reject (405, `Event "${r.event}" not allowed for entity "${r.path}".`)
  )}

  async prepend (...impl_functions) {
    // IMPORTANT: We might be called in parallel -> the ._handlers._handlers
    // game below avoids loosing registrations due to race conditions
    const _handlers = this._handlers._handlers || this._handlers
    const _new = this._handlers = { _handlers, on:[], before:[], after:[], _initial:[], _error:[] }
    await Promise.all (impl_functions.map (fn => is_impl(fn) && fn.call (this,this)))
    for (let each in _new) if (_new[each].length) _handlers[each] = [ ..._new[each], ..._handlers[each] ]
    this._handlers = _handlers
    return this
  }

}
module.exports = EventHandlers


//--------------------------------------------------------------------------
/** Registers event handlers. This is the central method to register handlers,
 * used by all respective public API methods, i.e. .on/before/after/reject.
 * @param {'on'|'before'|'after'} phase
 * @param {string|string[]} event
 * @param {string|string[]} path
 * @param {(req)=>{}} handler
 */
const _register = function (srv, phase, event, path, handler) { //NOSONAR

  if (!handler) [ handler, path ] = [ path ] // argument path is optional
  if (typeof handler !== 'function') expected `${{handler}} to be a function`

  // Canonicalize event argument
  if (!event || event === '*') event = undefined
  else if (is_array(event)) {
    for (let each of event) _register (srv, phase, each, path, handler)
    return this
  }
  else if (event === 'SAVE') {
    for (let each of ['CREATE','UPDATE']) _register (srv, phase, each, path, handler)
    return this
  }
  else if (event === 'each' || phase === 'after' && /^\(?each\)?/.test(handler)) {
    const h=handler; event = 'READ'
    handler = (rows,req) => is_array(rows) ? rows.forEach (r => h(r,req)) : rows && h(rows,req)
  }
  else if (typeof event === 'object') {
    // extract action name from an action definition's fqn
    event = event.name && /[^.]+$/.exec(event.name)[0] || expected `${{event}} to be a string or an action's CSN definition`
  }
  else event = AlternativeEvents[event] || event

  // Canonicalize path argument
  if (!path || path === '*') path = undefined
  else if (is_array(path)) {
    for (let each of path) _register (srv, phase, event, each, handler)
    return this
  }
  else if (typeof path === 'object') {
    path = path.name || expected `${{path}} to be a string or an entity's CSN definition`
  }
  else if (typeof path === 'string') {
    if (!path.startsWith(srv.name+'.')) path = `${srv.name}.${path}`
  }

  // Finally register with a filter function to match requests to be handled
  const _handlers = srv._handlers [event === 'error' ? '_error' : (handler._initial ? '_initial' : phase)] // REVISIT: remove _initial handlers
  _handlers.push (new EventHandler (phase, event, path, handler))

  if (phase === 'on') cds.emit('subscribe',srv,event) //> inform messaging service
  return srv
}


class EventHandler {
  constructor (phase, event, path, handler) {
    this[phase] = event || '*'
    if (path) this.path = path
    this.handler = handler
    Object.defineProperties (this, { // non-enumerable properties to improve debugging
      _initial: { value: handler._initial },
      for: { value:
        event && path ? (req) => (event === req.event) && (path === req.path || path === req.entity) :
        event ? (req) => (event === req.event) :
        path ? (req) => (path === req.path || path === req.entity) :
        /* else: */ () => true
      }
    })
  }
}


const is_impl = x => typeof x === 'function' && !(x.prototype && /^class\b/.test(x))
const is_array = Array.isArray
const AlternativeEvents = {
  SELECT: 'READ',
  GET: 'READ',
  PUT: 'UPDATE',
  POST: 'CREATE',
  INSERT: 'CREATE',
}


//--------------------------------------------------------------------------
// EXPERIMENTAL: It is not decided yet, whether we should keep the stuff below
// => Please do not use anywhere!
EventHandlers.prototype.onSucceeded = function (...args) { return _req_on (this, 'succeeded', ...args) }
EventHandlers.prototype.onFailed = function (...args) { return _req_on (this, 'failed', ...args) }
const _req_on = (srv, succeeded_or_failed, event, path, handler) => {
  if (!handler) [path,handler] = [undefined,path]
  return srv.before (event,path, req => req.on(succeeded_or_failed,handler))
}
