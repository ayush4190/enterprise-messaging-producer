const cds = require('../../_runtime/cds')
const { INSERT } = cds.ql

const RestRequest = require('../RestRequest')

const _error4 = rejected =>
  rejected.length > 1 ? { message: 'MULTIPLE_ERRORS', details: rejected.map(r => r.reason) } : rejected[0].reason

module.exports = async (_req, _res, next) => {
  const { _srv: srv, _query: query, _target, _data } = _req

  let result, location

  // unfortunately, express doesn't catch async errors -> try catch needed
  try {
    // add the data
    query.entries(_data)
    if (query.INSERT.entries.length > 1) {
      // > batch insert
      const reqs = query.INSERT.entries.map(
        entry => new RestRequest({ query: INSERT.into(query.INSERT.into).entries(entry), _target })
      )
      const ress = await Promise.allSettled(reqs.map(req => srv.dispatch(req)))
      const rejected = ress.filter(r => r.status === 'rejected')
      if (rejected.length) throw _error4(rejected)
      result = ress.map(r => r.value)
    } else {
      // > single insert
      const req = new RestRequest({ query, _target })
      result = await srv.dispatch(req)
      location = `../${req.entity.replace(srv.name + '.', '')}`
      for (const k in req.target.keys) location += `/${result[k]}`
    }
  } catch (e) {
    return next(e)
  }

  _req._result = { result, status: 201, location }
  next()
}
