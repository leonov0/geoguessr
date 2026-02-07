import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ isAuthenticated: () => boolean }>();
    if (request.isAuthenticated()) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
