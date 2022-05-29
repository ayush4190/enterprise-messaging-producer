const { isListValue, isObjectValue } = require('../utils')

const objectFieldToOrderBy = objectField => ({
  ref: [objectField.name.value],
  sort: objectField.value.value
})

const parseObjectValue = objectValue => {
  // OrderBy objects are supposed to contain only a single field
  return objectFieldToOrderBy(objectValue.fields[0])
}

const parseListValue = listValue => listValue.values.map(value => parseObjectValue(value))

const astToOrderBy = orderByArg => {
  const value = orderByArg.value
  if (isListValue(value)) {
    return parseListValue(value)
  } else if (isObjectValue(value)) {
    return [parseObjectValue(value)]
  }
}

module.exports = astToOrderBy
