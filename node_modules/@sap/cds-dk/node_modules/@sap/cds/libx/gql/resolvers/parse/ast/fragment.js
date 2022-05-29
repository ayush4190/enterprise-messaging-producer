const { isFragmentSpread } = require('../utils')

const getFragmentDefinitionForFragmentSpread = (info, fragmentSpread) => info.fragments[fragmentSpread.name.value]

const substituteFragment = (info, fragmentSpread) =>
  getFragmentDefinitionForFragmentSpread(info, fragmentSpread).selectionSet.selections

const fragmentSpreadSelections = (info, selections) =>
  selections.flatMap(selection => (isFragmentSpread(selection) ? substituteFragment(info, selection) : [selection]))

module.exports = fragmentSpreadSelections
