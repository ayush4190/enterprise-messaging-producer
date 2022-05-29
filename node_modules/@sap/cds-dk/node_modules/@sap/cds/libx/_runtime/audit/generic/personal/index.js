const cds = require('../../../cds')

const {
  attachDiffToContextHandler,
  calcModificationLogsHandler4Before,
  calcModificationLogsHandler4After,
  emitModificationHandler
} = require('./modification')
const { auditAccessHandler } = require('./access')

module.exports = function () {
  /*
   * prep context
   */
  this.before('*', req => (req.context._audit = req.context._audit || {}))

  /*
   * data modification
   */
  // REVISIT: diff() doesn't work in srv after phase but foreign key propagation has not yet taken place in srv before phase
  //          -> calc diff in db layer and store in audit data structure at context
  //          -> REVISIT for GA: clear req._.partialPersistentState?
  attachDiffToContextHandler._initial = true
  for (const entity of Object.values(this.entities).filter(e => e._auditCreate)) {
    cds.db.before('CREATE', entity, attachDiffToContextHandler)
    // create -> all new -> calcModificationLogsHandler in after phase
    cds.db.after('CREATE', entity, calcModificationLogsHandler4After)
    this.after('CREATE', entity, emitModificationHandler)
  }
  for (const entity of Object.values(this.entities).filter(e => e._auditUpdate)) {
    cds.db.before('UPDATE', entity, attachDiffToContextHandler)
    // update -> mixed (via deep) -> calcModificationLogsHandler in before and after phase
    cds.db.before('UPDATE', entity, calcModificationLogsHandler4Before)
    cds.db.after('UPDATE', entity, calcModificationLogsHandler4After)
    this.after('UPDATE', entity, emitModificationHandler)
  }
  for (const entity of Object.values(this.entities).filter(e => e._auditDelete)) {
    cds.db.before('DELETE', entity, attachDiffToContextHandler)
    // delete -> all done -> calcModificationLogsHandler in before phase
    cds.db.before('DELETE', entity, calcModificationLogsHandler4Before)
    this.after('DELETE', entity, emitModificationHandler)
  }

  /*
   * data access
   */
  for (const entity of Object.values(this.entities).filter(e => e._auditRead)) {
    this.after('READ', entity, auditAccessHandler)
  }
}
