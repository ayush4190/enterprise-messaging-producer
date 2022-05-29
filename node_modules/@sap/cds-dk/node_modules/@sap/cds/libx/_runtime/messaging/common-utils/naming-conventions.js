const _queueName = ({ appName, appID, ownNamespace }) => {
  const shrunkAppID = appID.substring(0, 4)
  return ownNamespace ? `${ownNamespace}/${appName}/${shrunkAppID}` : `${appName}/${shrunkAppID}`
}

const queueName = (options, optionsApp = {}) => {
  const namespace = options.credentials && options.credentials.namespace
  if (options.queue && options.queue.name) {
    if (namespace) return options.queue.name.replace(/\$namespace/g, namespace)
    return options.queue.name
  }
  const ownNamespace = namespace
  return _queueName({
    appName: optionsApp.appName || 'CAP',
    appID: optionsApp.appID || '00000000',
    ownNamespace
  })
}

module.exports = { queueName }
