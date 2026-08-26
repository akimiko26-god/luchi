import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  ARGON2_HASH_LENGTH,
  ARGON2_MEMORY_COST,
  ARGON2_PARALLELISM,
  ARGON2_TIME_COST,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../domain/constants/iam.constants';
import { WeakPasswordException } from '../../domain/exceptions/iam.exceptions';

@Injectable()
export class PasswordHasherService {
  async hash(password: string): Promise<string> {
    this.validatePolicy(password);
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: ARGON2_MEMORY_COST,
      timeCost: ARGON2_TIME_COST,
      parallelism: ARGON2_PARALLELISM,
      hashLength: ARGON2_HASH_LENGTH,
    });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  validatePolicy(password: string, username?: string): void {
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      throw new WeakPasswordException(
        `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
      );
    }
    if (!/[A-Z]/.test(password)) {
      throw new WeakPasswordException('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new WeakPasswordException('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new WeakPasswordException('Password must contain at least one digit');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new WeakPasswordException('Password must contain at least one special character');
    }
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      throw new WeakPasswordException('Password must not contain username');
    }
  }
}
