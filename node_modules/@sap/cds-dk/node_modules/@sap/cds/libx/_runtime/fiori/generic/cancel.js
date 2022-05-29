const cds = require('../../cds')
const { deleteDraft } = require('../utils/delete')

/**
 * Generic Handler for CANCEL requests.
 * In case of success it returns an empty object.
 * If the entry to be deleted does not exist, it rejects with error to return a 404.
 *
 * @param req
 */
const _handler = function (req) {
  return deleteDraft(req, this)
}

module.exports = cds.service.impl(function () {
  for (const entity of Object.values(this.entities).filter(e => e._isDraftEnabled)) {
    this.on('CANCEL', entity, _handler)
  }
})
