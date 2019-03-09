import { MiddlewareFunction, BadRequestException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { validate, ObjectSchema } from 'joi';
import { authUserSchema, authTokenSchema } from '../user/joi/auth-user.joi';
import { RequestHandlerParams } from 'express-serve-static-core';

export const bodyValidatorMiddleware: MiddlewareFunction =
  // tslint:disable-next-line:ban-types
  async (req: Request, res: Response, next: Function) => {
    const authSchema = req.path.includes(`/login`) ? authUserSchema : authTokenSchema;
    const inputRequest = req.path.includes(`/login`) ? req.body : req.headers;

    const result = validate(inputRequest, authSchema);

    if (result.error) {
      const errorMessage = result.error.details.shift().message;
      const message: string = errorMessage.replace(/["]/g, '');

      return next(new BadRequestException(`Validation failed: ${message}`));
    }

    next();
  };
