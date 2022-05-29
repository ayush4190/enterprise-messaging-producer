const { isListValue, isObjectValue } = require('../utils')

const parseObjectField = objectField => {
  const value = objectField.value
  if (isListValue(value)) {
    return parseListValue(value)
  } else if (isObjectValue(value)) {
    return parseObjectValue(value)
  } else {
    return value.value
  }
}

const parseObjectValue = objectValue =>
  objectValue.fields.reduce((entry, objectField) => {
    entry[objectField.name.value] = parseObjectField(objectField)
    return entry
  }, {})

const parseListValue = listValue => listValue.values.map(value => parseObjectValue(value))

const astToEntries = inputArg => {
  const value = inputArg.value
  if (isListValue(value)) {
    return parseListValue(value)
  } else if (isObjectValue(value)) {
    return parseObjectValue(value)
  }
}

module.exports = astToEntries
