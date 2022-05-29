const _checkRequiredCredentials = options => {
  if (!options || !options.credentials || !options.credentials.management || !options.credentials.amqp10) {
    throw new Error(
      'No messaging credentials found. Hint: You need to bind your app to a Message-Queuing service or provide the necessary credentials through environment variables.'
    )
  }
}

const _oa2 = management => ({
  ...management,
  auth: {
    ...management.auth,
    oauth2: {
      client: management.auth.oauth2.clientId,
      secret: management.auth.oauth2.clientSecret,
      endpoint: management.auth.oauth2.tokenUrl
    }
  }
})

module.exports = options => {
  _checkRequiredCredentials(options)
  return _oa2(options.credentials.management)
}
