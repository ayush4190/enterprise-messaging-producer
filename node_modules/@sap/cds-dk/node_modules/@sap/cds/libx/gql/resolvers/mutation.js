const cds = require('../../_runtime/cds')
const LOG = cds.log('graphql')

const { MUTATION_PREFIX } = require('../constants/adapter')
const { cdsName } = require('../utils')
const { executeCreate, executeUpdate, executeDelete } = require('./crud')

const GQL_MUTATION_REGEX = new RegExp(`^(${Object.values(MUTATION_PREFIX).join('|')})_(.+)$`)

const actionToExecuteFunction = {
  [MUTATION_PREFIX.CREATE]: executeCreate,
  [MUTATION_PREFIX.UPDATE]: executeUpdate,
  [MUTATION_PREFIX.DELETE]: executeDelete
}

module.exports = async (service, gqlName, field) => {
  const { 1: mutationAction, 2: gqlNameWithoutAction } = gqlName.match(GQL_MUTATION_REGEX)
  const entityFQN = `${service.name}.${cdsName(gqlNameWithoutAction)}`

  LOG.log(`mutation on ${entityFQN}`)

  return await actionToExecuteFunction[mutationAction](service, entityFQN, field)
}
