const { ARGUMENT, HELPER_TYPES, EQUALITY_OPERATOR, STRING_MATCH_OPERATOR } = require('../constants/adapter')
const { GQL_ROOT, GQL_KEYWORDS, SCALAR_TYPES } = require('../constants/graphql')
const {
  generateSchemaObject,
  typeToArgumentType,
  generateArgumentsForType,
  isTypeScalar,
  typeWithoutListBrackets
} = require('./utils')

const generateScalarFilterTypes = () => Object.values(SCALAR_TYPES).flatMap(scalarType => fullFilter(scalarType))

const fullFilter = type => {
  const operations = Object.values(EQUALITY_OPERATOR)
  if (type === SCALAR_TYPES.STRING) {
    operations.push(...Object.values(STRING_MATCH_OPERATOR))
  }
  const entries = operations.reduce((acc, operation) => {
    acc[operation] = type
    return acc
  }, {})
  return generateSchemaObject(GQL_KEYWORDS.INPUT, `${type}_${ARGUMENT.FILTER}`, entries)
}

const typeDefMapToQueryStringArray = typeDefs => {
  let schema = []

  // Create root query (containing services)
  schema.push(
    ...generateSchemaObject(
      GQL_KEYWORDS.TYPE,
      GQL_ROOT.QUERY,
      Object.keys(typeDefs).reduce((fields, serviceName) => {
        fields[serviceName] = serviceName
        return fields
      }, {})
    )
  )

  // Create types from services (each containing entities)
  for (const [serviceName, entities] of Object.entries(typeDefs)) {
    const fields = {}
    for (const entityName of Object.keys(entities)) {
      const entityNameWithoutServicePrefix = entityName.replace(`${serviceName}_`, '')
      const argsString = generateArgumentsForType(entityName, [
        ARGUMENT.FILTER,
        ARGUMENT.ORDER_BY,
        ARGUMENT.TOP,
        ARGUMENT.SKIP
      ])
      fields[`${entityNameWithoutServicePrefix}${argsString}`] = `[${entityName}]`
    }
    schema.push(...generateSchemaObject(GQL_KEYWORDS.TYPE, serviceName, fields))
  }

  // Create types from entities (each containing elements)
  for (const entities of Object.values(typeDefs)) {
    for (const [entityName, elements] of Object.entries(entities)) {
      const fields = {}
      for (const [elementName, elementType] of Object.entries(elements)) {
        const argsString = generateArgumentsForType(elementType, [
          ARGUMENT.FILTER,
          ARGUMENT.ORDER_BY,
          ARGUMENT.TOP,
          ARGUMENT.SKIP
        ])
        fields[`${elementName}${argsString}`] = elementType
      }
      schema.push(...generateSchemaObject(GQL_KEYWORDS.TYPE, entityName, fields))
    }
  }

  // Create filter input types for scalars
  schema.push(...generateScalarFilterTypes())

  // Create filter input types for entity types
  for (const entities of Object.values(typeDefs)) {
    for (const [entityName, elements] of Object.entries(entities)) {
      const fields = {}
      for (const [elementName, elementType] of Object.entries(elements)) {
        if (isTypeScalar(typeWithoutListBrackets(elementType))) {
          fields[elementName] = typeToArgumentType(elementType, ARGUMENT.FILTER)
        }
      }
      if (Object.keys(fields).length > 0) {
        schema.push(...generateSchemaObject(GQL_KEYWORDS.INPUT, `${entityName}_${ARGUMENT.FILTER}`, fields))
      }
    }
  }

  // Create sort direction enum types for order by
  schema.push(...generateSchemaObject(GQL_KEYWORDS.ENUM, HELPER_TYPES.SORT_DIRECTION, ['asc', 'desc']))

  // Create orderBy input types for entity types
  for (const entities of Object.values(typeDefs)) {
    for (const [entityName, elements] of Object.entries(entities)) {
      const fields = {}
      for (const [elementName, elementType] of Object.entries(elements)) {
        fields[elementName] = typeToArgumentType(elementType, ARGUMENT.ORDER_BY)
      }
      schema.push(...generateSchemaObject(GQL_KEYWORDS.INPUT, `${entityName}_${ARGUMENT.ORDER_BY}`, fields))
    }
  }

  return schema
}

module.exports = { typeDefMapToQueryStringArray }
