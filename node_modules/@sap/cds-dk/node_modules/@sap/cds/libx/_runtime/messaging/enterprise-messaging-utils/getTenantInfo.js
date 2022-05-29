const cds = require('../../cds')
const _transform = o => ({ subdomain: o.subscribedSubdomain, tenant: o.subscribedTenantId })

const getTenantInfo = async tenant => {
  const provisioning = await cds.connect.to('ProvisioningService')
  const tx = provisioning.tx({ user: new cds.User.Privileged() })
  try {
    const result = tenant
      ? _transform(await tx.get(`tenant`, { ID: tenant }))
      : (await tx.read('tenant')).map(o => _transform(o))
    await tx.commit()
    return result
  } catch (e) {
    try {
      await tx.rollback()
      throw e
    } catch (_) {
      throw e
    }
  }
}

module.exports = getTenantInfo
