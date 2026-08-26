import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';
import type { AccessTokenPayload } from '../../application/services/token.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export type AuthUser = AccessTokenPayload;

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
  return request.user;
});

export type RequestWithMeta = Request & {
  user?: AuthUser;
  correlationId?: string;
};

export function getRequestMeta(req: RequestWithMeta): {
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
} {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    correlationId: req.correlationId,
  };
}
