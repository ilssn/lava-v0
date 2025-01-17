import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new HttpException('Authorization header is missing', HttpStatus.UNAUTHORIZED);
    }

    // 这里可以添加更多的鉴权逻辑，比如验证 token 的有效性

    return true;
  }
} 