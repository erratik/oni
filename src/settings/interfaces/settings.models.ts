import { Document } from 'mongoose';

export interface credentialsDBModel {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope: string;
}

export interface SettingsDBModel {
  space: string;
  owner: string;
  credentials?: Array<credentialsDBModel>;
}

/**
 *
 *
 * @export
 * @interface SettingsModel
 * @extends {SettingsDBModel}
 * @extends {Document}
 */
export interface SettingsModel extends SettingsDBModel, Document {}
