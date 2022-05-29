const cds = require('../../_runtime/cds')
const LOG = cds.log('graphql')

const { cdsName } = require('../utils')
const { executeRead } = require('./crud')

module.exports = async (service, gqlName, field) => {
  const entityFQN = `${service.name}.${cdsName(gqlName)}`

  LOG.log(`query on ${entityFQN}`)

  return await executeRead(service, entityFQN, field)
}
