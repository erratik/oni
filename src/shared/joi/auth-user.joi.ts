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
  authorization: string().required(),
}).options({ stripUnknown: true });
