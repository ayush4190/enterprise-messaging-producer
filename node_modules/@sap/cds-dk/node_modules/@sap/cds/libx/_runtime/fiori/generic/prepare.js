const cds = require('../../cds')
const { SELECT } = cds.ql

const { isActiveEntityRequested } = require('../utils/where')
const { ensureDraftsSuffix, ensureNoDraftsSuffix } = require('../utils/handler')
const { getColumns } = require('../../cds-services/services/utils/columns')

const { DRAFT_COLUMNS_CQN } = require('../../common/constants/draft')

/**
 * Generic Handler for PreparationAction requests.
 * In case of success it returns the prepared draft entry.
 *
 * @param req
 */
const _handler = async function (req) {
  if (req.query.SELECT.from.ref.length > 1 || isActiveEntityRequested(req.query.SELECT.from.ref[0].where || [])) {
    req.reject(400, 'Action "draftPrepare" can only be called on a draft entity')
  }

  const target = ensureDraftsSuffix(req.target.name)
  const columns = [
    ...getColumns(this.model.definitions[ensureNoDraftsSuffix(req.target.name)], {
      removeIgnore: true,
      filterVirtual: true
    }).map(obj => obj.name),
    ...DRAFT_COLUMNS_CQN.filter(column => column.ref[0] !== 'DraftAdministrativeData_DraftUUID')
  ]
  columns.push({ ref: ['DRAFT.DraftAdministrativeData', 'inProcessByUser'], as: 'draftAdmin_inProcessByUser' })
  const select = SELECT.from(target)
    .columns(columns)
    .join('DRAFT.DraftAdministrativeData')
    .on([
      { ref: [target, 'DraftAdministrativeData_DraftUUID'] },
      '=',
      { ref: ['DRAFT.DraftAdministrativeData', 'DraftUUID'] }
    ])
    .where(req.query.SELECT.from.ref[0].where)

  const result = await cds.tx(req).run(select)

  if (result.length === 0) req.reject(404)

  if (result[0].draftAdmin_inProcessByUser !== req.user.id) {
    // REVISIT: security log?
    req.reject(403, 'DRAFT_LOCKED_BY_ANOTHER_USER')
  }
  delete result[0].draftAdmin_inProcessByUser

  return result[0]
}

module.exports = cds.service.impl(function () {
  for (const entity of Object.values(this.entities).filter(e => e._isDraftEnabled)) {
    this.on('draftPrepare', entity, _handler)
  }
})
