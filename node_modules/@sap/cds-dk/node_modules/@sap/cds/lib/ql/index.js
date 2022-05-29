const cds = require('../index')
require = path => { // eslint-disable-line no-global-assign
  const clazz = module.require (path); if (!clazz._api) return clazz
  Object.defineProperty (clazz.prototype, 'cmd', { value: path.match(/\w+$/)[0] })
  return clazz._api()
}

module.exports = Object.assign (_deprecated_srv_ql, { cdr: true,
  SELECT: require('./SELECT'),
  INSERT: require('./INSERT'),
  UPDATE: require('./UPDATE'),
  DELETE: require('./DELETE'),
  CREATE: require('./CREATE'),
  DROP: require('./DROP'),
})

function _deprecated_srv_ql() { // eslint-disable-next-line no-console
  console.trace(`
    Method 'srv.ql(req)' is deprecated and superceded by 'cds.context'.
    Please use global SELECT instead of 'const { SELECT } = srv.ql(req)'.
  `)
  return module.exports
}

if (cds.env.features.cls && cds.env.features.debug_queries) {
  const Query = module.exports, { then } = Query.prototype
  const { AsyncResource } = require('async_hooks')
  Object.defineProperty (Query,'then',{ get(){
    const q = new AsyncResource('cds.Query')
    return (r,e) => q.runInAsyncScope (then,this,r,e)
  }})
}

module.exports._reset = ()=>{ // for strange tests only
  const _name = cds.env.sql.names === 'quoted' ? n =>`"${n}"` : n => n.replace(/[.:]/g,'_')
  Object.defineProperty (require('./Query').prototype,'valueOf',{ configurable:1, value: function(cmd=this.cmd) {
    return `${cmd} ${_name(this._target.name)} `
  }})
  return this
}
