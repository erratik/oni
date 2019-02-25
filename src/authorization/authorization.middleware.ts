import { AuthorizationService } from './authorization.service';
import { ForbiddenException, Injectable, InternalServerErrorException, MiddlewareFunction, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from '../shared/models/error.model';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly authorizationService: AuthorizationService) {}

  async resolve(): Promise<MiddlewareFunction> {
    return this.middlewareFunction;
  }

  public middlewareFunction: MiddlewareFunction = async (req: Request, _: Response, next) => {
    try {
      const authorized: boolean = await this.authorizationService.isRequestAuthorized(req);
      if (authorized) {
        next();
      } else {
        throw new ForbiddenException();
      }
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      } else if (err && err.code === ErrorCode.AUTHENTICATION_METHOD_NOT_VALID) {
        throw new ForbiddenException(err.message || '');
      } else if (err && err.code === ErrorCode.AUTHORIZATION_MISSING) {
        throw new UnauthorizedException(err.message || '');
      } else {
        throw new InternalServerErrorException(err.message || err);
      }
    }
  };
}
