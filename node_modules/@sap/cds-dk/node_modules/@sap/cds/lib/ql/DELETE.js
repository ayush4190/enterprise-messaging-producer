const Whereable = require('./Whereable')

module.exports = class DELETE extends Whereable {

  static _api() {
    return Object.assign ((..._) => (new this).from(..._), {
      from: (..._) => (new this).from(..._),
    })
  }

  from(entity, key) {
    this.DELETE.from = this._target_name4 (...arguments) // supporting tts
    if (key) this.byKey(key)
    return this
  }

  valueOf() {
    return super.valueOf('DELETE FROM')
  }

}
