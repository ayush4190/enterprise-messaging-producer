const getColumns = require('../utils/columns')
//  REVISIT: Remove support for @odata.on... with @sap/cds ^6
const ANNOTATIONS = ['@cds.on.insert', '@odata.on.insert', '@cds.on.update', '@odata.on.update']
const { ensureNoDraftsSuffix } = require('../../common/utils/draft')

const _getAnnotationNames = column => {
  const annotations = []
  for (const annotation of ANNOTATIONS) {
    if (column[annotation]) {
      annotations.push(annotation)
    }
  }

  return annotations
}

const getAnnotatedColumns = (entityName, csn) => {
  const entityNameWithoutSuffix = ensureNoDraftsSuffix(entityName)
  if (!csn || !csn.definitions[entityNameWithoutSuffix]) {
    return undefined
  }
  const columns = getColumns(csn.definitions[entityNameWithoutSuffix])
  const insertAnnotatedColumns = new Map()
  const updateAnnotatedColumns = new Map()

  for (const column of columns) {
    const annotations = _getAnnotationNames(column)

    for (const annotation of annotations) {
      let symbol = column[annotation]['='] || column[annotation]['#']
      if (symbol) symbol = symbol.replace('$', '')
      else symbol = column[annotation]

      if (annotation.endsWith('.insert')) {
        insertAnnotatedColumns.set(column.name, { symbol })
      } else {
        updateAnnotatedColumns.set(column.name, { symbol })
      }
    }
  }

  return {
    insertAnnotatedColumns: insertAnnotatedColumns,
    updateAnnotatedColumns: updateAnnotatedColumns
  }
}

module.exports = getAnnotatedColumns
