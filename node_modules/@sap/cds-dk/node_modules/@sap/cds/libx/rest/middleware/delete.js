const RestRequest = require('../RestRequest')

module.exports = async (_req, _res, next) => {
  const { _srv: srv, _query: query, _target, _params } = _req

  // unfortunately, express doesn't catch async errors -> try catch needed
  try {
    const req = new RestRequest({ query, _target })

    // req.data is filled with keys during read and delete
    if (_params) req.data = _params[_params.length - 1]

    await srv.dispatch(req)
  } catch (e) {
    return next(e)
  }

  _req._result = { result: null, status: 204 }
  next()
}
