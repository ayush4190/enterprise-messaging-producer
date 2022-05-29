const { STRING_MATCH_OPERATOR } = require('../../../constants/adapter')
const { GQL_TO_CDS_QL_OPERATOR, GQL_TO_CDS_STRING_MATCH_OPERATOR } = require('../../../constants/cds')
const { isListValue, isObjectValue } = require('../utils')

const stringMatchOperatorToLikeString = (operator, string) => {
  switch (operator) {
    case STRING_MATCH_OPERATOR.STARTSWITH:
      return `${string}%`
    case STRING_MATCH_OPERATOR.ENDSWITH:
      return `%${string}`
    case STRING_MATCH_OPERATOR.CONTAINS:
      return `%${string}%`
  }
}

const arrayInsertBetweenFlat = (array, element) => {
  return [...array].flatMap((e, index) => (index < array.length - 1 ? [e, element] : [e])).flat()
}

const joinedXprFrom_xprs = (_xprs, operator) => {
  return { xpr: arrayInsertBetweenFlat(_xprs, operator) }
}

const gqlOperatorToCdsOperator = gqlOperator =>
  GQL_TO_CDS_QL_OPERATOR[gqlOperator] || GQL_TO_CDS_STRING_MATCH_OPERATOR[gqlOperator]

const gqlValueToCdsValue = (cdsOperator, gqlOperator, gqlValue) =>
  cdsOperator === 'like' ? stringMatchOperatorToLikeString(gqlOperator, gqlValue) : gqlValue

const objectFieldTo_xpr = (objectField, columnName) => {
  const gqlOperator = objectField.name.value
  const cdsOperator = gqlOperatorToCdsOperator(gqlOperator)
  const gqlValue = objectField.value.value
  const cdsValue = gqlValueToCdsValue(cdsOperator, gqlOperator, gqlValue)

  return [{ ref: [columnName] }, cdsOperator, { val: cdsValue }]
}

const parseObjectField = (objectField, columnName) => {
  const value = objectField.value
  const name = objectField.name.value
  if (isListValue(value)) {
    return parseListValue(value, name)
  } else if (isObjectValue(value)) {
    return parseObjectValue(value, name)
  } else {
    return objectFieldTo_xpr(objectField, columnName)
  }
}

const parseObjectValue = (objectValue, columnName) => {
  const _xprs = objectValue.fields.map(field => parseObjectField(field, columnName))
  return _xprs.length === 1 ? _xprs[0] : joinedXprFrom_xprs(_xprs, 'and')
}

const parseListValue = (listValue, columnName) => {
  const _xprs = listValue.values.map(value => parseObjectValue(value, columnName))
  return _xprs.length === 1 ? _xprs[0] : joinedXprFrom_xprs(_xprs, 'or')
}

const astToWhere = filterArg => {
  const value = filterArg.value
  if (isListValue(value)) {
    return parseListValue(value)
  } else if (isObjectValue(value)) {
    return parseObjectValue(value)
  }
}

module.exports = astToWhere
