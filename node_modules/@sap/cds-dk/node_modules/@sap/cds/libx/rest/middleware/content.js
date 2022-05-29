const PPP = { POST: 1, PUT: 1, PATCH: 1 }
const UPDATE = { PUT: 1, PATCH: 1 }

module.exports = (req, res, next) => {
  if (PPP[req.method]) {
    if (req.headers['content-type'] && req.headers['content-type'] !== 'application/json') {
      throw { statusCode: 415, code: '415', message: 'INVALID_CONTENT_TYPE_ONLY_JSON' }
    }
    if (UPDATE[req.method] && Array.isArray(req.body)) {
      throw { statusCode: 400, code: '400', message: `INVALID_${req.method}` }
    }
  }

  next()
}
