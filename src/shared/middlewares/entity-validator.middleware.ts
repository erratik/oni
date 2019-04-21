import { MiddlewareFunction, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { validate } from 'joi';
import { spaceEntitySchema, settingsEntitySchema, credentialsEntitySchema } from '../joi/entities.joi';
import { authTokenSchema } from '../../shared/joi/auth-user.joi';

export enum MiddlewarePaths {
  SpaceCallback = 'spaces/callback',
  SpaceUpdate = 'spaces/update',
  SpaceCreate = 'spaces/create',
  SpaceDelete = 'spaces/delete',
  SettingsUpdate = 'settings/update',
  SettingsCreate = 'settings/create',
  SettingsDelete = 'settings/create',
  CredentialsDelete = 'settings/delete/credentials',
}


export const entityValidatorMiddleware: MiddlewareFunction = async (req: Request, res: Response, next: Function) => {
  let entitySchema = null;
  const path = req.path.split('/v1/')[1];
  const isUnhandledPath = true;
  switch (path) {
    case MiddlewarePaths.SpaceDelete:
    case MiddlewarePaths.SpaceCreate:
    case MiddlewarePaths.SpaceUpdate: {
      entitySchema = spaceEntitySchema;
      break;
    }
    case MiddlewarePaths.SettingsDelete:
    case MiddlewarePaths.SettingsCreate:
    case MiddlewarePaths.SettingsUpdate: {
      entitySchema = settingsEntitySchema;
      break;
    }
    case MiddlewarePaths.CredentialsDelete: {
      entitySchema = credentialsEntitySchema;
      break;
    }
    default:
      console.log(`Entity ${path} not handled by middleware`);
  }

  const authorization = req.method === 'GET' && path.includes(MiddlewarePaths.SpaceCallback) ? { error: null } : validate(req.headers, authTokenSchema);

  const entity = isUnhandledPath ? { error: null } : validate(req.body, entitySchema);

  const error = entity.error || authorization.error;

  if (error && !path.includes('token')) {
    const errorMessage = error.details.shift().message;
    const message: string = errorMessage.replace(/["]/g, '');
    return next(new BadRequestException(`Validation failed: ${message}`));
  }

  next();
};
