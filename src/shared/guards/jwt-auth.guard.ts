import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    console.log('protect my balls');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any): any {
    console.log('balls');
    if (err || !user) {
      throw err ||
        new UnauthorizedException(
          `You are not authorized to access this resource`,
          JSON.stringify(err),
        );
    }
    return user;
  }
}
