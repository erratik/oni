import { Document } from 'mongoose';

export interface SpaceDBModel {
  name: string;
  icon: string;
  description: string;
}

/**
 *
 *
 * @export
 * @interface SpaceModel
 * @extends {SpaceDBModel}
 * @extends {Document}
 */
export interface SpaceModel extends SpaceDBModel, Document {}
