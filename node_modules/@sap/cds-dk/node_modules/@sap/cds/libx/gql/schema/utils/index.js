const { ARGUMENT, HELPER_TYPES } = require('../../constants/adapter')
const { GQL_LIST_REGEX, SCALAR_TYPES } = require('../../constants/graphql')

const generateSchemaObject = (type, name, fields) => {
  const schema = [`${type} ${name} {`]
  if (Array.isArray(fields)) {
    schema.push(...fields.map(e => `  ${e}`))
  } else {
    schema.push(...Object.entries(fields).map(([k, v]) => `  ${k}: ${v}`))
  }
  schema.push('}', '')
  return schema
}

const generateArgumentsForType = (type, args) =>
  `(${args.map(action => `${action}: ${typeToArgumentType(type, action)}`).join(', ')})`

const typeToArgumentType = (type, action) => {
  switch (action) {
    case ARGUMENT.FILTER:
      return appendSuffixToType(type, ARGUMENT.FILTER, true)
    case ARGUMENT.ORDER_BY:
      return isTypeScalar(type) ? HELPER_TYPES.SORT_DIRECTION : appendSuffixToType(type, ARGUMENT.ORDER_BY, true)
    case ARGUMENT.TOP:
      return SCALAR_TYPES.INT
    case ARGUMENT.SKIP:
      return SCALAR_TYPES.INT
  }
}

const isTypeScalar = type => Object.values(SCALAR_TYPES).includes(type)

const isTypeList = type => type.match(GQL_LIST_REGEX)

// Type without list brackets even if type isn't a list
const typeWithoutListBrackets = type => type.replace(GQL_LIST_REGEX, '$1')

const appendSuffixToType = (type, suffix, forceToList) => {
  if (isTypeList(type) || forceToList) {
    return `[${typeWithoutListBrackets(type)}_${suffix}]`
  } else {
    return `${type}_${suffix}`
  }
}

module.exports = {
  generateSchemaObject,
  generateArgumentsForType,
  typeToArgumentType,
  isTypeScalar,
  isTypeList,
  typeWithoutListBrackets,
  appendSuffixToType
}
