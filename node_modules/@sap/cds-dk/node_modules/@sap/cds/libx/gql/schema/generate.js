const { typeDefMapToMutationStringArray } = require('./mutation')
const { typeDefMapToQueryStringArray } = require('./query')
const { servicesToTypeDefMap } = require('./typeDefMap')

const typeDefMapToSchemaString = typeDefs => {
  let schema = []

  schema.push(...typeDefMapToQueryStringArray(typeDefs))

  schema.push(...typeDefMapToMutationStringArray(typeDefs))

  return schema.join('\n')
}

module.exports = services => {
  const typeDefMap = servicesToTypeDefMap(services)
  return typeDefMapToSchemaString(typeDefMap)
}
