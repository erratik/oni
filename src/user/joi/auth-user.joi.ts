import { object, string, ObjectSchema, strip } from 'joi';

export const authUserSchema: ObjectSchema = object({
  username: string().required(),
  password: string()
    .alphanum()
    .min(6)
    .max(36)
    .required(),
});

export const authTokenSchema: ObjectSchema = object({
  authorization: string()
    // .replace('Bearer ', '')
    .required(),
  host: string(),
  accept: string(),
  'user-agent': string(),
});
