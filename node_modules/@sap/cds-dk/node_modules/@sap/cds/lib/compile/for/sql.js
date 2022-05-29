/** REVISIT: uses internal APIs to restore compile.for.sql in SNAPI */
const compile = require ('@sap/cds-compiler/lib/backends')
let _compile

module.exports = function cds_compile_for_sql (src,o) {
  _compile = _compile || compile.toSqlWithCsn || compile.for_sql
  // for_sql directly returns a CSN and not an object with a csn property
  const res = _compile(src,{...o,csn:true})
  return res.csn || res
}
