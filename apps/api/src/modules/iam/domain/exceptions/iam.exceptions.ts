import { DomainException } from '../../../../shared/kernel/domain.base';

export class EmailTakenException extends DomainException {
  constructor() {
    super('Email is already registered', 'EMAIL_TAKEN');
  }
}

export class UsernameTakenException extends DomainException {
  constructor() {
    super('Username is already taken', 'USERNAME_TAKEN');
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class AccountBannedException extends DomainException {
  constructor() {
    super('Account is banned', 'ACCOUNT_BANNED');
  }
}

export class AccountLockedException extends DomainException {
  constructor() {
    super('Account is temporarily locked', 'ACCOUNT_LOCKED');
  }
}

export class WeakPasswordException extends DomainException {
  constructor(message: string) {
    super(message, 'WEAK_PASSWORD');
  }
}

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}

export class SessionLimitException extends DomainException {
  constructor() {
    super('Maximum number of active sessions reached', 'SESSION_LIMIT');
  }
}

export class RefreshTokenInvalidException extends DomainException {
  constructor() {
    super('Refresh token is invalid or expired', 'REFRESH_TOKEN_EXPIRED');
  }
}
