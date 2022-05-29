const { gqlName } = require('../utils')
const resolveQuery = require('./query')
const resolveMutation = require('./mutation')
const { enrichAST } = require('./parse/ast')

const wrapResolver = (service, resolver) => (root, args, context, info) => {
  const response = {}

  const enrichedFieldNodes = enrichAST(info)

  for (const fieldNode of enrichedFieldNodes) {
    for (const field of fieldNode.selectionSet.selections) {
      const gqlName = field.name.value
      const responseKey = field.alias ? field.alias.value : gqlName

      response[responseKey] = resolver(service, gqlName, field)
    }
  }

  return response
}

module.exports = services => {
  const Query = {}
  const Mutation = {}

  for (const service of services) {
    const gqlServiceName = gqlName(service.name)
    Query[gqlServiceName] = wrapResolver(service, resolveQuery)
    Mutation[gqlServiceName] = wrapResolver(service, resolveMutation)
  }

  return { Query, Mutation }
}
