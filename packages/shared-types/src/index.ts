export type ApiResponse<T> = {
  data: T;
};

export type PaginatedMeta = {
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  traceId?: string;
};

export type UserRole =
  | 'guest'
  | 'user'
  | 'verified_user'
  | 'volunteer'
  | 'organization'
  | 'moderator'
  | 'senior_moderator'
  | 'support'
  | 'finance'
  | 'content_manager'
  | 'administrator'
  | 'super_administrator';

export type TransactionType =
  | 'REWARD'
  | 'TRANSFER'
  | 'PURCHASE'
  | 'REFUND'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'ROLLBACK'
  | 'FEE'
  | 'EXCHANGE';

export type HealthStatus = {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
};
