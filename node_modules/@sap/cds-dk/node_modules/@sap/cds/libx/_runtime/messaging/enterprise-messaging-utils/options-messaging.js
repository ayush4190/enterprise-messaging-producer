const _getOAuth2 = opts => ({
  ...opts,
  oa2: {
    client: opts.oa2.client || opts.oa2.clientid,
    secret: opts.oa2.secret || opts.oa2.clientsecret,
    endpoint: opts.oa2.endpoint || opts.oa2.tokenendpoint,
    granttype: opts.oa2.granttype
  }
})

// protocols are: httprest or amqp10ws
const _optionsMessaging = (options, protocol) => {
  const opts =
    options &&
    options.credentials &&
    options.credentials.messaging &&
    options.credentials.messaging.filter(entry => entry.protocol.includes(protocol))[0]
  if (!opts)
    throw new Error(
      `No ${protocol} credentials found. Hint: You need to bind your app to an Enterprise-Messaging service or provide the necessary credentials through environment variables.`
    )
  const res = _getOAuth2(opts)
  if (options.amqp) {
    if (!res.amqp) res.amqp = options.amqp
    else Object.assign(res.amqp, options.amqp)
  }
  return res
}

module.exports = _optionsMessaging
