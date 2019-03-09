import { object, string, ObjectSchema, strip } from 'joi';

export const spaceEntitySchema: ObjectSchema = object({
  name: string().required(),
}).options({ stripUnknown: true });
