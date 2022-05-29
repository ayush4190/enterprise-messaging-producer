const compile = require ('../cdsc')

module.exports = function cds_compile_for_odata (csn,_o) {
  if (_is_odata(csn))  return csn
  let {_4odata} = csn; if (!_4odata) {
    const o = compile._options.for.odata(_o) //> required to inspect .sql_mapping below
    _4odata = compile.for.odata (csn,o)
    // cache result for subsequent uses
    Object.defineProperty (csn, '_4odata', { value: _4odata, configurable:1, writable:1 })
    // compatibility with csn.json for old Java stack
    if (o.sql_mapping) _4odata['@sql_mapping'] = o.sql_mapping
  }
  return _4odata
}

const _is_odata = csn => csn.meta && csn.meta.transformation === 'odata'
