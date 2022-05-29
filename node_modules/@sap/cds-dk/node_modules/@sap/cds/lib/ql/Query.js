const { inspect } = require('util')
const cds = require('../index')

module.exports = class Query {

  constructor(_={}) { this[this.cmd] = _ }

  /** Creates a derived instance that initially inherits all properties. */
  clone(){
    return { __proto__:this, [this.cmd]: {__proto__: this[this.cmd]} }
  }

  /** Binds this query to be executed with the given service */
  bind (srv) {
    return Object.defineProperty (this,'_srv',{ value:srv, configurable:true, writable:true })
  }

  /** Turns all queries into Thenables which execute with primary db by default */
  then (r,e) {
    return (this._srv || cds.db) .run (this) .then (r,e)
  }

  /** Beautifies output in REPL */
  [inspect.custom]() {
    const {cmd} = this, colors = process.env.CDS_TERM_COLORS !== false
    return `{ ${cmd}: `+ inspect(this[cmd], { colors, depth: 22 })
      .replace(/^\w*\s/, '')
      .replace(
        /{ ref: \[([^\]]*)\] }/g,
        (_,ref) => '{ref:[' + ref.slice(1, -1) + ']}'
      )
      .replace(/{ val: ([^ ]*) }/g, '{val:$1}')
      .replace(/{ (xpr|ref|val): /g, '{$1:') +
    '}'
  }

  _target_ref4 (target, arg2) {

    // Resolving this._target --> REVISIT: this is not reliable !!!
    Object.defineProperty (this, '_target', { value: _target4 (target,arg2), configurable:true, writable:true })

    return target && (
      typeof target === 'string' ? cds.parse.path(target) :
      target.ref    ? target :
      target.SELECT ? target :
      target.SET    ? target :
      target.raw    ? cds.parse.path(...arguments) :
      target.name   ? {ref:[target.name]} : 0
    )
    || this._expected `${{target}} to be an entity path string, a CSN definition, a {ref}, a {SELECT}, or a {SET}`
  }

  //> REVISIT: should we rather have consistent .from/.entity/.into in CQN?
  _target_name4 (...args) {
    const {ref} = this._target_ref4 (...args)
    return ref.length === 1 && typeof ref[0] === 'string' ? ref[0] : {ref}
  }

  _expected (...args) {
    return cds.error.expected (...args)
  }

  _own (property, _ = this[this.cmd]) {
    const pd = Reflect.getOwnPropertyDescriptor (_, property)
    return pd && pd.value
  }

  _add (property, values) {
    const _ = this[this.cmd], pd = Reflect.getOwnPropertyDescriptor (_,property)
    _[property] = !pd || !pd.value ? values : [ ...pd.value, ...values ]
    return this
  }

  valueOf (cmd=this.cmd) {
    return `${cmd} ${_name(this._target.name)} `
  }

}


const _target4 = (target, arg2) =>  target && (
  typeof target === 'string' ? { name: target } :
  target.name ? target : //> assumed to be a linked csn definition
  target.ref ? { name: target.ref[0] } :
  target.raw ? _target4(arg2) :
  target._target || { name: undefined }
)

const _name = cds.env.sql.names === 'quoted' ? n =>`"${n}"` : n => n.replace(/[.:]/g,'_')
