const cds = require('..')


function cds_load (files, options) {
  const all = cds.resolve(files,options)
  if (!all)  return cds.error.reject (
    `Couldn't find a CDS model for '${files}' in ${cds.root}`, { code:'MODEL_NOT_FOUND', files }
  )
  return this.get (all,options,'inferred')
}


function cds_get (files, options, _flavor) { // NOSONAR

  const o = typeof options === 'string' ? { flavor:options } : options || {}
  if (!files) files = ['*']; else if (!Array.isArray(files)) files = [files]
  if (o.files || o.flavor === 'files') return cds.resolve(files,o)
  if (o.sources || o.flavor === 'sources') return _sources4 (cds.resolve(files,o))

  const csn = cds.compile (files,o,
    o.parse  ? 'parsed' :
    o.plain  ? 'xtended' :
    o.clean  ? 'xtended' : // for compatibility
    o.flavor || _flavor || 'parsed'
  )
  return csn.then
    ? csn.then (_csn => _finalize(_csn,o)) // async compile
    : _finalize (csn,o) // synchronous compile
}

const _finalize = (csn,o) => {
  if (!o.silent) cds.emit ('loaded', csn)
  return csn
}

const _sources4 = async (files) => {
  const {path:{relative},fs:{promises:{readFile}}} = cds.utils, cwd = cds.root
  const sources = await Promise.all (files.map (f => readFile(f,'utf-8')))
  return files.reduce ((all,f,i) => { all[relative(cwd,f)] = sources[i]; return all },{})
}

module.exports = Object.assign (cds_load, {
  parsed: cds_get,
  properties: (...args) => (cds_load.properties = require('./etc/properties').read) (...args),
  yaml: (file) => (cds_load.yaml = require('./etc/yaml').read) (file),
  csv: (file) => (cds_load.csv = require('./etc/csv').read) (file),
})
