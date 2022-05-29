const { ARGUMENT, MUTATION_PREFIX, INPUT_OBJECT_SUFFIX } = require('../constants/adapter')
const { GQL_ROOT, GQL_KEYWORDS, SCALAR_TYPES } = require('../constants/graphql')
const { generateSchemaObject, typeToArgumentType, isTypeScalar, appendSuffixToType } = require('./utils')

const typeDefMapToMutationStringArray = typeDefs => {
  let schema = []

  // Create root mutation (containing services)
  schema.push(
    ...generateSchemaObject(
      GQL_KEYWORDS.TYPE,
      GQL_ROOT.MUTATION,
      Object.keys(typeDefs).reduce((fields, serviceName) => {
        fields[serviceName] = `${serviceName}_${INPUT_OBJECT_SUFFIX.INPUT}`
        return fields
      }, {})
    )
  )

  // Create types for mutations from services (each containing entities)
  for (const [serviceName, entities] of Object.entries(typeDefs)) {
    const fields = {}
    for (const entityName of Object.keys(entities)) {
      const entityNameWithoutServicePrefix = entityName.replace(`${serviceName}_`, '')

      const createMutationName = `${MUTATION_PREFIX.CREATE}_${entityNameWithoutServicePrefix}`
      const createMutationArgs = `(${ARGUMENT.INPUT}: [${entityName}_${INPUT_OBJECT_SUFFIX.CREATE}]!)`
      fields[`${createMutationName}${createMutationArgs}`] = `[${entityName}]`

      const updateMutationName = `${MUTATION_PREFIX.UPDATE}_${entityNameWithoutServicePrefix}`
      const updateMutationArgs = `(${ARGUMENT.FILTER}: ${typeToArgumentType(entityName, ARGUMENT.FILTER)}, ${
        ARGUMENT.INPUT
      }: ${entityName}_${INPUT_OBJECT_SUFFIX.UPDATE}!)`
      fields[`${updateMutationName}${updateMutationArgs}`] = `[${entityName}]`

      const deleteMutationName = `${MUTATION_PREFIX.DELETE}_${entityNameWithoutServicePrefix}`
      const deleteMutationArgs = `(${ARGUMENT.FILTER}: ${typeToArgumentType(entityName, ARGUMENT.FILTER)})`
      fields[`${deleteMutationName}${deleteMutationArgs}`] = SCALAR_TYPES.INT
    }
    schema.push(...generateSchemaObject(GQL_KEYWORDS.TYPE, `${serviceName}_${INPUT_OBJECT_SUFFIX.INPUT}`, fields))
  }

  // Create input types for create mutations from entities (each containing elements)
  for (const entities of Object.values(typeDefs)) {
    for (const [entityName, elements] of Object.entries(entities)) {
      const fields = {}
      for (const [elementName, elementType] of Object.entries(elements)) {
        if (isTypeScalar(elementType)) {
          fields[elementName] = elementType
        } else {
          fields[elementName] = appendSuffixToType(elementType, INPUT_OBJECT_SUFFIX.CREATE)
        }
      }
      schema.push(...generateSchemaObject(GQL_KEYWORDS.INPUT, `${entityName}_${INPUT_OBJECT_SUFFIX.CREATE}`, fields))
    }
  }

  // Create input types for update mutations from entities (each containing elements)
  for (const entities of Object.values(typeDefs)) {
    for (const [entityName, elements] of Object.entries(entities)) {
      const fields = {}
      for (const [elementName, elementType] of Object.entries(elements)) {
        if (isTypeScalar(elementType)) {
          fields[elementName] = elementType
        } else {
          fields[elementName] = appendSuffixToType(elementType, INPUT_OBJECT_SUFFIX.UPDATE)
        }
      }
      schema.push(...generateSchemaObject(GQL_KEYWORDS.INPUT, `${entityName}_${INPUT_OBJECT_SUFFIX.UPDATE}`, fields))
    }
  }

  return schema
}

module.exports = { typeDefMapToMutationStringArray }
