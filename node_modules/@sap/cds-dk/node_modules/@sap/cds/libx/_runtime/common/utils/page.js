const cds = require('../../cds')

const { LIMIT } = require('../constants/limit')
const DEFAULT = (cds.env.query && cds.env.query.limit && cds.env.query.limit.default) || LIMIT.PAGE.MAX
const MAX = (cds.env.query && cds.env.query.limit && cds.env.query.limit.max) || LIMIT.PAGE.MAX

const _pageSizes = {}

const getPageSize = def => {
  if (_pageSizes[def.name]) return _pageSizes[def.name]

  const outer = (def._service && getPageSize(def._service)) || { default: DEFAULT, max: MAX }

  let dfault = def[LIMIT.ANNOTATION.DEFAULT]
  if (dfault == null) {
    dfault = def[LIMIT.ANNOTATION.SHORTHAND]
  }
  if (dfault == null) {
    dfault = outer.default
  }
  let max = def[LIMIT.ANNOTATION.MAX]
  if (max == null) {
    max = outer.max
  }
  if (max === 0) {
    max = Number.MAX_SAFE_INTEGER
  }
  return { default: max && (!dfault || dfault > max) ? max : dfault, max }
}

const getDefaultPageSize = def => getPageSize(def).default

const getMaxPageSize = def => getPageSize(def).max

module.exports = {
  getPageSize,
  getDefaultPageSize,
  getMaxPageSize
}
