const _createLikeComparison = (searchXpr, columns, excludeSearch) => {
  const likeExpression = []

  columns.forEach((column, index, columns) => {
    // if negated search, we need to add is null check
    if (excludeSearch) {
      likeExpression.push('(', column, 'IS NULL', 'OR')
    }

    const searchStringEscaped = searchXpr.val.toLowerCase().replace(/(\^|_|%)/g, '^$1')

    likeExpression.push(
      'lower',
      '(',
      column,
      ')',
      excludeSearch ? 'NOT LIKE' : 'LIKE',
      { val: `%${searchStringEscaped}%` },
      'ESCAPE',
      "'^'"
    )

    if (excludeSearch) {
      likeExpression.push(')')
    }

    if (index !== columns.length - 1) {
      likeExpression.push(excludeSearch ? 'AND' : 'OR')
    }
  })

  return likeExpression
}

// Computes a LIKE expression for a search query.
const searchToLike = (cqnSearchPhrase, columns, expression = []) => {
  cqnSearchPhrase.forEach((element, index) => {
    if (element === 'not') return

    if (element === 'or' || element === 'and') {
      expression.push(element)
      return
    }

    if (element.xpr) {
      expression.push('(')
      searchToLike(element.xpr, columns, expression)
      expression.push(')')
      return
    }

    const excludeSearch = cqnSearchPhrase[index - 1] === 'not'
    const likeComparison = _createLikeComparison(element, columns, excludeSearch)
    expression.push('(', ...likeComparison, ')')
  })

  return expression
}

module.exports = searchToLike
