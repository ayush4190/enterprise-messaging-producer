const GQL_ROOT = {
  QUERY: 'Query',
  MUTATION: 'Mutation'
}

const GQL_KEYWORDS = {
  TYPE: 'type',
  ENUM: 'enum',
  INPUT: 'input'
}

const SCALAR_TYPES = {
  INT: 'Int',
  FLOAT: 'Float',
  STRING: 'String',
  BOOLEAN: 'Boolean',
  ID: 'ID'
}

// String starts with [ and ends with ]
// Capture group captures in between brackets
const GQL_LIST_REGEX = /^\[(.+)\]$/

const AST_NODE_KIND = {
  ListValue: 'ListValue',
  ObjectValue: 'ObjectValue',
  ObjectField: 'ObjectField',
  FragmentSpread: 'FragmentSpread',
  Variable: 'Variable',
  Name: 'Name'
}

module.exports = { GQL_ROOT, GQL_KEYWORDS, SCALAR_TYPES, GQL_LIST_REGEX, AST_NODE_KIND }
