const prepareTopic = (topic, inbound, options, superPrepareTopic) => {
  const t = options.format === 'cloudevents' ? topic.replace(/\./g, '/') : topic
  return superPrepareTopic(t, inbound).replace(/\$namespace/g, options.credentials && options.credentials.namespace)
}

const prepareHeaders = (headers, event, options, superPrepareHeaders) => {
  if (options.format === 'cloudevents') {
    if (!('source' in headers))
      headers.source =
        '/' +
        options.publishPrefix
          .replace(/\$namespace/g, options.credentials && options.credentials.namespace)
          .replace(/\/ce\/$/, '')
          .replace(/\/$/, '')
          .replace(/\/-$/, '')
  }
  superPrepareHeaders(headers, event)
}

const defaultOptions = options => {
  if (options.format === 'cloudevents') {
    if (!options.subscribePrefix) options.subscribePrefix = '+/+/+/ce/'
    if (!options.publishPrefix) options.publishPrefix = '$namespace/ce/'
  }
}

module.exports = {
  prepareTopic,
  prepareHeaders,
  defaultOptions
}
