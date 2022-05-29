import sdkCore from '@sap-cloud-sdk/core'
export interface DestinationOptions extends Omit<sdkCore.DestinationOptions, 'selectionStrategy'> {
  /*
   * @see https://sap.github.io/cloud-sdk/api/1.50.0/modules/sap_cloud_sdk_core#DestinationSelectionStrategies
   */
  selectionStrategy?: 'alwaysProvider' | 'alwaysSubscriber' | 'subscriberFirst'
}
