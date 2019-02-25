import { Document } from 'mongoose';

export interface BaseDBModel {
  lastModified: Date;
  createdBy: string;
  label: string;
}

export interface UserDBModel {
  username: string;
  password: string;
}

export interface UserModel extends BaseDBModel, UserDBModel, Document {}
