const RestRequest = require('../RestRequest')

module.exports = async (_req, _res, next) => {
  const { _srv: srv, _query: query, _target, _params } = _req

  let result,
    status = 200

  // unfortunately, express doesn't catch async errors -> try catch needed
  try {
    const req = new RestRequest({ query, _target })

    // req.data is filled with keys during read and delete
    if (_params) req.data = _params[_params.length - 1]

    result = await srv.dispatch(req)

    // 204 or 404?
    if (result === null && query.SELECT.one) {
      if (_target.ref.length > 1) status = 204
      else throw { code: 404 }
    }
  } catch (e) {
    return next(e)
  }

  _req._result = { result, status }
  next()
}
