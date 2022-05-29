const hasOmitValuesPreference = (preferHeader, preference) => {
  if (!preferHeader) return
  const preferHeaderPreferences = preferHeader.split(',')
  return preferHeaderPreferences.includes(`omit-values=${preference}`)
}

/**
 * Apply the `preference-applied` response HTTP header to `omit-values=nulls` or
 * `omit-values=defaults` correspondingly when `null` or `defaults` values are
 * omitted from the response payload.
 *
 * @param {import('../okra/odata-server/core/OdataResponse')} response
 * @param {Map<string, boolean> | null} omitValuesPreference
 */
const applyOmitValuesPreference = (response, omitValuesPreference) => {
  if (!omitValuesPreference || omitValuesPreference.size === 0 || !response) return
  let [preference, shouldApplyPreference] = omitValuesPreference.entries().next().value

  if (shouldApplyPreference) {
    const preferenceApplied = response.getHeader('preference-applied')

    if (preferenceApplied) {
      preference = `${preferenceApplied},${preference}`
    }

    response.setHeader('preference-applied', preference)
  }
}

/**
 * Omit a `null` or `defaults` value from the payload response when the prefer HTTP
 * header is set to `omit-values=nulls` or `omit-values=defaults` correspondingly.
 *
 * **Note**: The response payload to a `PUT`/`PATCH` (update) operation MUST include
 * any properties whose values were changed as part of the operation regardless of the
 * `omit-values` preference.
 *
 * **Note**: The response payload to a `POST` operation MUST include any properties not
 * set to their default value.
 *
 * **REVISIT**: The handling of delta payloads and instance annotations is not currently
 * implemented, as the runtime does not yet support those features.
 * In the future, you might want to use the `processArgs.pathSegments` argument for the
 * implementation of delta payloads.
 *
 * @param {import('../../../../types/api').templateProcessorProcessFnArgs} processArgs
 * @param {import('../../../../cds-services/adapter/odata-v4/ODataRequest')} request
 * @param {Map<string, boolean> | null} omitValuesPreference
 * @param {object | undefined} previousRow
 */
const omitValue = (processArgs, request, omitValuesPreference, previousRow) => {
  const preferHeader = request.headers.prefer
  if (!preferHeader || !omitValuesPreference) return

  const { row, key, element, isRoot } = processArgs
  const defaultValue = element.default && element.default.val ? element.default.val : null
  const responseValue = row[key]
  const isDefaultValue = responseValue === defaultValue

  if (isDefaultValue) {
    // Don't omit the response value if the request is an update operation and it has changed it
    // REVISIT: We don't have access to deep previous rows, therefore we always ignore default values in deep operations
    if (request.event === 'UPDATE' && isRoot) {
      if (previousRow === undefined) return
      if (responseValue !== previousRow[key]) return
    }

    // try to remove the property whose value is the default or null from the response payload
    const isValueOmitted = delete row[key]

    // parse the prefer header
    const preferHeaderPreferences = preferHeader.split(',').map(preference => preference.trim())

    // update the omitValuesPreference map
    if (preferHeaderPreferences.includes('omit-values=nulls')) {
      omitValuesPreference.set('omit-values=nulls', isValueOmitted)
    } else if (preferHeaderPreferences.includes('omit-values=defaults')) {
      omitValuesPreference.set('omit-values=defaults', isValueOmitted)
    }
  }
}

module.exports = {
  omitValue,
  hasOmitValuesPreference,
  applyOmitValuesPreference
}
