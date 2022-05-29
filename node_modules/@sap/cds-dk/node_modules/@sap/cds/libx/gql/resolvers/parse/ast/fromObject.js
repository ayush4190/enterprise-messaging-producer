const { AST_NODE_KIND } = require('../../../constants/graphql')

const valueToGenericScalarValue = value => ({
  kind: 'GenericScalarValue',
  value
})

const keyToName = key => ({
  kind: AST_NODE_KIND.Name,
  value: key
})

const keyValueToObjectField = (k, v) => ({
  kind: AST_NODE_KIND.ObjectField,
  name: keyToName(k),
  value: variableToValue(v)
})

const objectToObjectValue = object => ({
  kind: AST_NODE_KIND.ObjectValue,
  fields: Object.entries(object).map(([k, v]) => keyValueToObjectField(k, v))
})

const arrayToListValue = array => ({
  kind: AST_NODE_KIND.ListValue,
  values: array.map(a => objectToObjectValue(a))
})

const variableToValue = variable => {
  if (Array.isArray(variable)) {
    return arrayToListValue(variable)
  } else if (typeof variable === 'object') {
    return objectToObjectValue(variable)
  } else {
    return valueToGenericScalarValue(variable)
  }
}

module.exports = variableValue => variableToValue(variableValue)
