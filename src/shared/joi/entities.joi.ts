import { object, string, ObjectSchema, strip } from 'joi';

export const spaceEntitySchema: ObjectSchema = object({
  name: string().required(),
}).options({ stripUnknown: true });

export const settingsEntitySchema: ObjectSchema = object({
  space: string().required(),
}).options({ stripUnknown: true });

export const credentialsEntitySchema: ObjectSchema = object({
  space: string().required(),
  scope: string().required(),
}).options({ stripUnknown: true });
