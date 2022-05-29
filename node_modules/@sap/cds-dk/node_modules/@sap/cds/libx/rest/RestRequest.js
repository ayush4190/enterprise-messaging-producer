const cds = require('../_runtime/cds')

class RestRequest extends cds.Request {
  constructor(args) {
    super(args)

    // REVISIT: should not be necessary
    /*
     * propagate _ (i.e., req._ and, hence, req._.req/res)
     * -> in the old adapters this is also set in OdataRequest/RestRequest
     */
    Object.setPrototypeOf(this._, cds.context._)

    /*
     * new req.res api [work in progress -> not official]:
     * - req.res.status(202)
     * - req.res.set('location', '/Books/301')
     * this way is $batch compatible, i.e., the status and headers can be set on "subresponse"
     */
    this._status = null
    this._headers = {}
    const that = this
    this.res = {
      status: s => (that._status = s),
      set: (k, v) => (that._headers[k] = v)
    }
  }
}

module.exports = RestRequest
