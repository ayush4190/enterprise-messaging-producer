const https = require('https')

const _errorObj = result => {
  const errorObj = new Error('Authorization failed')
  errorObj.target = { kind: 'TOKEN' }
  errorObj.response = result
  return errorObj
}

const requestToken = ({ client, secret, endpoint }, tenant, tokenStore) =>
  new Promise((resolve, reject) => {
    const options = {
      host: endpoint.replace('/oauth/token', '').replace('https://', ''),
      path: '/oauth/token?grant_type=client_credentials&response_type=token',
      headers: {
        Authorization: 'Basic ' + Buffer.from(client + ':' + secret).toString('base64')
      }
    }
    if (tenant) options.headers['x-zid'] = tenant

    https.get(options, res => {
      res.setEncoding('utf8')
      let chunks = ''
      res.on('data', chunk => {
        chunks += chunk
      })
      res.on('end', () => {
        const result = { body: chunks, headers: res.headers, statusCode: res.statusCode }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(_errorObj(result))
        }
        try {
          const json = JSON.parse(result.body)
          if (!json.access_token) {
            reject(_errorObj(result))
          }
          // store token on tokenStore
          tokenStore.token = json.access_token
          resolve(json.access_token)
        } catch (e) {
          reject(_errorObj(result))
        }
      })
    })
  })

module.exports = requestToken
