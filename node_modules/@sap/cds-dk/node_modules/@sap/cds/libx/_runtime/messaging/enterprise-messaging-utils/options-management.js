const _oa2 = management => ({
  ...management,
  oa2: {
    client: management.oa2.clientid,
    secret: management.oa2.clientsecret,
    endpoint: management.oa2.tokenendpoint
  }
})

module.exports = options => {
  if (!options || !options.credentials || !options.credentials.management) {
    throw new Error(
      'No management credentials found. Hint: You need to bind your app to an Enterprise-Messaging service or provide the necessary credentials through environment variables.'
    )
  }
  return _oa2(options.credentials.management[0])
}
