const objectToAST = require('./fromObject')

const getVariableValueForVariable = (info, variable) => info.variableValues[variable.name.value]

const substituteVariable = (info, variable) => objectToAST(getVariableValueForVariable(info, variable))

module.exports = substituteVariable
