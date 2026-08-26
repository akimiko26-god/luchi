export const SYSTEM_OWNER_ID = '00000000-0000-0000-0000-000000000001';
export const OWNER_TYPE = {
  USER: 'USER',
  SYSTEM: 'SYSTEM',
  ORGANIZATION: 'ORGANIZATION',
} as const;
export const ACCOUNT_TYPE = {
  MAIN: 'MAIN',
} as const;
export const ENTRY_TYPE = {
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
} as const;
export const TRANSACTION_TYPE = {
  REWARD: 'REWARD',
  TRANSFER: 'TRANSFER',
  PURCHASE: 'PURCHASE',
  ADMIN_CREDIT: 'ADMIN_CREDIT',
} as const;
export const TRANSACTION_STATUS = {
  POSTED: 'POSTED',
} as const;
