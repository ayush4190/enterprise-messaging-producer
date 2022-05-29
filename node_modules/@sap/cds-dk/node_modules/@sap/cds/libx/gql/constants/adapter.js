const { SCALAR_TYPES } = require('./graphql')

// TODO own scalar types
const CDS_TO_GRAPHQL_TYPES = {
  'cds.Binary': SCALAR_TYPES.STRING,
  'cds.Boolean': SCALAR_TYPES.BOOLEAN,
  'cds.Date': SCALAR_TYPES.STRING,
  'cds.DateTime': SCALAR_TYPES.STRING,
  'cds.Decimal': SCALAR_TYPES.FLOAT,
  'cds.DecimalFloat': SCALAR_TYPES.FLOAT,
  'cds.Double': SCALAR_TYPES.STRING,
  'cds.Integer': SCALAR_TYPES.INT,
  'cds.Integer64': SCALAR_TYPES.STRING,
  'cds.LargeBinary': SCALAR_TYPES.STRING,
  'cds.LargeString': SCALAR_TYPES.STRING,
  'cds.String': SCALAR_TYPES.STRING,
  'cds.Time': SCALAR_TYPES.STRING,
  'cds.Timestamp': SCALAR_TYPES.STRING,
  'cds.UUID': SCALAR_TYPES.ID
}

const ARGUMENT = {
  INPUT: 'input',
  FILTER: 'filter',
  ORDER_BY: 'orderBy',
  TOP: 'top',
  SKIP: 'skip'
}

const HELPER_TYPES = {
  SORT_DIRECTION: 'SortDirection'
}

const EQUALITY_OPERATOR = {
  EQ: 'eq',
  NE: 'ne',
  GT: 'gt',
  GE: 'ge',
  LE: 'le',
  LT: 'lt'
}

const STRING_MATCH_OPERATOR = {
  STARTSWITH: 'startswith',
  ENDSWITH: 'endswith',
  CONTAINS: 'contains'
}

const MUTATION_PREFIX = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
}

const INPUT_OBJECT_SUFFIX = {
  INPUT: 'input',
  CREATE: 'C',
  UPDATE: 'U'
}

module.exports = {
  CDS_TO_GRAPHQL_TYPES,
  ARGUMENT,
  HELPER_TYPES,
  EQUALITY_OPERATOR,
  STRING_MATCH_OPERATOR,
  MUTATION_PREFIX,
  INPUT_OBJECT_SUFFIX
}
