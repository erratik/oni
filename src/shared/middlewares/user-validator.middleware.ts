import { MiddlewareFunction, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { validate } from 'joi';
import { authUserSchema } from '../../shared/joi/auth-user.joi';

export const userValidatorMiddleware: MiddlewareFunction = async (req: Request, res: Response, next: Function) => {
  const result = validate(req.body, authUserSchema);

  if (result.error) {
    const errorMessage = result.error.details.shift().message;
    const message: string = errorMessage.replace(/["]/g, '');

    return next(new BadRequestException(`Validation failed: ${message}`));
  }

  next();
};
