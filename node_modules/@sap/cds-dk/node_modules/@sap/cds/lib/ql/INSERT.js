const Query = require('./Query')
const is_array = Array.isArray

module.exports = class INSERT extends Query {
  static _api() {
    return Object.assign ((..._) => (new this).entries(..._), {
      into: (..._) => (new this).into(..._),
    })
  }

  into (entity, ...data) {
    this.INSERT.into = this._target_name4 (...arguments) // supporting tts
    if (data.length) this.entries(...data)
    return this
  }

  entries (...x) {
    this.INSERT.entries = is_array(x[0]) ? x[0] : x
    return this
  }
  columns (...x) {
    this.INSERT.columns = is_array(x[0]) ? x[0] : x
    return this
  }
  values (...x) {
    this.INSERT.values = is_array(x[0]) ? x[0] : x
    return this
  }
  rows (...rows) {
    if (is_array(rows[0]) && is_array(rows[0][0])) rows = rows[0]
    if (!is_array(rows[0])) this._expected `Arguments ${{rows}} to be an array of arrays`
    this.INSERT.rows = rows
    return this
  }
  _rows(rows, ...args) {

    if (Array.isArray(rows)) {
      // check if all the entries in the array are arrays
      if (rows.every(e => Array.isArray(e))) {
        this.INSERT.rows = rows
        // check if array contains one or multiple objects
      } else if (rows.every(e => typeof e === 'object')) {
        this.INSERT.entries = rows
        // the rows have been added as arguments
      } else if (args.length !== 0) {
        args.unshift(rows)
        this.INSERT.rows = args
      } else {
        this.INSERT.values = rows
      }
    } else if (typeof rows === 'object') {
      this.INSERT.entries = rows
    }

    return this
  }
  as (query) {
    if (!query || !query.SELECT) this._expected `${{query}} to be a CQN {SELECT} query object`
    this.INSERT.as = query
    return this
  }
  valueOf() {
    return super.valueOf('INSERT INTO')
  }
}
