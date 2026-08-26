import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../kernel/domain.base';

const DOMAIN_EXCEPTION_STATUS: Record<string, number> = {
  EMAIL_TAKEN: 409,
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_BANNED: 403,
  ACCOUNT_LOCKED: 423,
  REFRESH_TOKEN_EXPIRED: 401,
  USER_NOT_FOUND: 404,
  SESSION_LIMIT: 429,
  WEAK_PASSWORD: 422,
  ACCOUNT_NOT_FOUND: 404,
  INSUFFICIENT_RAYS: 422,
  INVALID_RAY_AMOUNT: 422,
  TRANSFER_TO_SELF: 422,
  TASK_FULL: 422,
  BENEFICIARY_REQUIRED: 422,
  NEED_BENEFICIARY_CONFIRMATION: 422,
  ATTACHMENT_REQUIRED: 422,
};

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  traceId?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    const problem = this.toProblemDetails(exception, request);

    if (problem.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(problem.detail, exception instanceof Error ? exception.stack : undefined);
    }

    response.status(problem.status).json(problem);
  }

  private toProblemDetails(exception: unknown, request: Request): ProblemDetails {
    const traceId = (request as Request & { correlationId?: string }).correlationId;

    if (exception instanceof DomainException) {
      const status = DOMAIN_EXCEPTION_STATUS[exception.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;
      return {
        type: `https://api.luchi.app/errors/${exception.code.toLowerCase()}`,
        title: exception.name,
        status,
        detail: exception.message,
        instance: request.url,
        code: exception.code,
        traceId,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const detail =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as { message?: string | string[] }).message ?? exception.message);

      return {
        type: `https://api.luchi.app/errors/http-${status}`,
        title: exception.name,
        status,
        detail: Array.isArray(detail) ? detail.join(', ') : String(detail),
        instance: request.url,
        code: 'HTTP_EXCEPTION',
        traceId,
      };
    }

    return {
      type: 'https://api.luchi.app/errors/internal',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred',
      instance: request.url,
      code: 'INTERNAL_ERROR',
      traceId,
    };
  }
}
