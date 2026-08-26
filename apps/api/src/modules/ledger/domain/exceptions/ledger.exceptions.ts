import { DomainException } from '../../../../shared/kernel/domain.base';

export class AccountNotFoundException extends DomainException {
  constructor() {
    super('Ledger account not found', 'ACCOUNT_NOT_FOUND');
  }
}

export class InsufficientRaysException extends DomainException {
  constructor() {
    super('Недостаточно Лучей', 'INSUFFICIENT_RAYS');
  }
}

export class InvalidRayAmountException extends DomainException {
  constructor() {
    super('Amount must be a positive integer', 'INVALID_RAY_AMOUNT');
  }
}

export class TransferToSelfException extends DomainException {
  constructor() {
    super('Cannot transfer Rays to yourself', 'TRANSFER_TO_SELF');
  }
}
