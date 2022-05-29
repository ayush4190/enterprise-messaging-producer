const { AST_NODE_KIND } = require('../../../constants/graphql')

const isFragmentSpread = value => value.kind === AST_NODE_KIND.FragmentSpread
const isListValue = value => value.kind === AST_NODE_KIND.ListValue
const isObjectValue = value => value.kind === AST_NODE_KIND.ObjectValue
const isVariable = value => value.kind === AST_NODE_KIND.Variable

module.exports = { isFragmentSpread, isListValue, isObjectValue, isVariable }
