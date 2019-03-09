import { MiddlewareFunction, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { validate } from 'joi';
import { authTokenSchema } from '../../shared/joi/auth-user.joi';

export const tokenValidatorMiddleware: MiddlewareFunction = async (req: Request, res: Response, next: Function) => {
  const result = validate(req.headers, authTokenSchema);

  if (result.error) {
    const errorMessage = result.error.details.shift().message;
    const message: string = errorMessage.replace(/["]/g, '');

    return next(new BadRequestException(`Validation failed: ${message}`));
  }

  next();
};
