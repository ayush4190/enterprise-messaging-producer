const cdsName = gqlName => {
  return gqlName.replace(/_/g, '.')
}

const gqlName = cdsName => {
  return cdsName.replace(/\./g, '_')
}

module.exports = {
  cdsName,
  gqlName
}
