import { Document } from 'mongoose';

export interface BaseDBModel {
  lastModified: Date;
  createdBy: string;
  label: string;
}

export interface AuthorizationDBModel {
  token: string;
  expiry: Date;
  scope: string;
}

export interface UserDBModel {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  authorization: Array<AuthorizationDBModel>;
}

/**
 *
 *
 * @export
 * @interface UserModel
 * @extends {BaseDBModel}
 * @extends {UserDBModel}
 * @extends {Document}
 */
export interface UserModel extends BaseDBModel, UserDBModel, Document {}
