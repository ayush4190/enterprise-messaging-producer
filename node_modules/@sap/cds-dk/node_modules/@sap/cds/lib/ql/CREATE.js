const Query = require('./Query')
const $ = Object.assign

module.exports = class CREATE extends Query {

  static _api() {
    return $((..._) => (new this).entity(..._), {
      entity: (..._) => (new this).entity(..._),
    })
  }

  entity (e, elements) {
    if (elements)
      this.CREATE.entity = { elements: elements, kind: 'entity', name:e }
    else
      this.CREATE.entity = e && e.elements ? e : this._target_name4(e)
    return this
  }

  as (query) {
    if (!query || !query.SELECT) this._expected `${{query}} to be a CQN {SELECT} object`
    this.CREATE.as = query
    return this
  }
}
