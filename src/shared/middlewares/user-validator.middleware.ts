import { MiddlewareFunction, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { validate } from 'joi';
import { authUserSchema, registerUserSchema } from '../joi/auth-user.joi';
import * as CryptoJS from 'crypto-js';

export const userValidatorMiddleware: MiddlewareFunction = async (req: Request, res: Response, next: Function) => {
  const { origin } = req.headers;

  if (!!origin && origin === process.env.TACHIKOMA_URL) {
    req.body.password = CryptoJS.AES.decrypt(req.body.password.trim(), process.env.STATE).toString(CryptoJS.enc.Utf8);
  }

  const result = validate(req.body, req.path.includes('/register') ? registerUserSchema : authUserSchema);
  if (result.error) {
    const errorMessage = result.error.details.shift().message;
    const message: string = errorMessage.replace(/["]/g, '');

    return next(new BadRequestException(`Validation failed: ${message}`));
  }

  next();
};
