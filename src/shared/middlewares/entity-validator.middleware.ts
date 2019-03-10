import { MiddlewareFunction, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { validate } from 'joi';
import { spaceEntitySchema, settingsEntitySchema, credentialsEntitySchema } from '../joi/entities.joi';
import { authTokenSchema } from '../../shared/joi/auth-user.joi';
import { Paths } from '../../app.constants';

export const entityValidatorMiddleware: MiddlewareFunction = async (req: Request, res: Response, next: Function) => {
  let entitySchema = null;
  const path = req.path.split('/v1/')[1];
  const isUnhandledPath = true;
  switch (path) {
    case Paths.SpaceDelete:
    case Paths.SpaceCreate:
    case Paths.SpaceUpdate: {
      entitySchema = spaceEntitySchema;
      break;
    }
    case Paths.SettingsDelete:
    case Paths.SettingsCreate:
    case Paths.SettingsUpdate: {
      entitySchema = settingsEntitySchema;
      break;
    }
    case Paths.CredentialsDelete: {
      entitySchema = credentialsEntitySchema;
      break;
    }
    default:
      console.log(`Entity ${path} not handled by middleware`);
  }

  const authorized = validate(req.headers, authTokenSchema);
  const entity = isUnhandledPath ? { error: null } : validate(req.body, entitySchema);

  const error = entity.error || authorized.error;
  if (error) {
    const errorMessage = error.details.shift().message;
    const message: string = errorMessage.replace(/["]/g, '');
    return next(new BadRequestException(`Validation failed: ${message}`));
  }

  next();
};
