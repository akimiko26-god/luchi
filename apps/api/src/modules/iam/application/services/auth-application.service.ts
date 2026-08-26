import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONFIG_KEY, type AuthConfig } from '../../../../shared/config/app.config';
import { AuditService } from '../../../../shared/infrastructure/audit/audit.service';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { USER_STATUS } from '../../domain/constants/iam.constants';
import {
  AccountBannedException,
  AccountLockedException,
  EmailTakenException,
  InvalidCredentialsException,
  RefreshTokenInvalidException,
  UserNotFoundException,
  UsernameTakenException,
} from '../../domain/exceptions/iam.exceptions';
import {
  AuthResponseDto,
  AuthSessionResult,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  UserProfileDto,
} from '../dto/auth.dto';
import { PasswordHasherService } from './password-hasher.service';
import { TokenService } from './token.service';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { UserRepository, UserWithRoles } from '../../infrastructure/repositories/user.repository';

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
};

@Injectable()
export class AuthApplicationService {
  private readonly lockouts = new Map<string, { count: number; lockedUntil?: number }>();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, meta: RequestMeta): Promise<AuthSessionResult> {
    if (!dto.acceptTerms) {
      throw new HttpException(
        { code: 'TERMS_NOT_ACCEPTED', message: 'You must accept terms' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const email = dto.email.toLowerCase();
    const username = dto.username.toLowerCase();

    if (await this.userRepository.findByEmail(email)) {
      throw new EmailTakenException();
    }
    if (await this.userRepository.findByUsername(username)) {
      throw new UsernameTakenException();
    }

    this.passwordHasher.validatePolicy(dto.password, username);
    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({ where: { name: 'user' } });
      if (!role) {
        throw new Error('Default role "user" not found. Run db:seed first.');
      }

      const created = await tx.user.create({
        data: {
          email,
          username,
          displayName: dto.displayName,
          passwordHash,
          userRoles: { create: { roleId: role.id } },
        },
      });

      await tx.account.create({
        data: {
          ownerId: created.id,
          ownerType: 'USER',
          accountType: 'MAIN',
        },
      });

      return created;
    });

    await this.auditService.log({
      actorId: user.id,
      action: 'user.register',
      resourceType: 'user',
      resourceId: user.id,
      newValues: { email: user.email, username: user.username },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      correlationId: meta.correlationId,
    });

    return this.createSessionForUser(user.id, meta);
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<AuthSessionResult> {
    const email = dto.email.toLowerCase();
    this.ensureNotLocked(email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.recordFailedAttempt(email);
      throw new InvalidCredentialsException();
    }

    if (user.status === USER_STATUS.BANNED) {
      throw new AccountBannedException();
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, dto.password);
    if (!valid) {
      this.recordFailedAttempt(email);
      throw new InvalidCredentialsException();
    }

    this.clearFailedAttempts(email);

    await this.auditService.log({
      actorId: user.id,
      action: 'user.login',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      correlationId: meta.correlationId,
    });

    return this.createSessionForUser(user.id, meta);
  }

  async refresh(refreshToken: string, _meta: RequestMeta): Promise<AuthSessionResult> {
    const hash = this.tokenService.hashRefreshToken(refreshToken);
    const session = await this.sessionRepository.findByRefreshHash(hash);
    if (!session) {
      throw new RefreshTokenInvalidException();
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || user.status === USER_STATUS.BANNED) {
      throw new RefreshTokenInvalidException();
    }

    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newHash = this.tokenService.hashRefreshToken(newRefreshToken);
    await this.sessionRepository.rotate(session.id, newHash, this.tokenService.getRefreshExpiresAt());

    const response = this.buildAuthResponse(user);
    return { ...response, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string | undefined, userId: string | undefined, meta: RequestMeta): Promise<void> {
    if (refreshToken) {
      const hash = this.tokenService.hashRefreshToken(refreshToken);
      const session = await this.sessionRepository.findByRefreshHash(hash);
      if (session) {
        await this.sessionRepository.revoke(session.id);
      }
    }

    if (userId) {
      await this.auditService.log({
        actorId: userId,
        action: 'user.logout',
        resourceType: 'user',
        resourceId: userId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        correlationId: meta.correlationId,
      });
    }
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    return this.toProfileDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, meta: RequestMeta): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const updated = await this.userRepository.update(userId, {
      displayName: dto.displayName,
      bio: dto.bio,
      city: dto.city,
    });

    await this.auditService.log({
      actorId: userId,
      action: 'user.update_profile',
      resourceType: 'user',
      resourceId: userId,
      oldValues: { displayName: user.displayName, bio: user.bio, city: user.city },
      newValues: { displayName: updated.displayName, bio: updated.bio, city: updated.city },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      correlationId: meta.correlationId,
    });

    const refreshed = await this.userRepository.findById(userId);
    if (!refreshed) {
      throw new UserNotFoundException();
    }
    return this.toProfileDto(refreshed);
  }

  private async createSessionForUser(userId: string, meta: RequestMeta): Promise<AuthSessionResult> {
    const authConfig = this.configService.get<AuthConfig>(AUTH_CONFIG_KEY);
    const maxSessions = authConfig?.maxSessionsPerUser ?? 5;
    const activeSessions = await this.sessionRepository.countActiveForUser(userId);
    if (activeSessions >= maxSessions) {
      await this.sessionRepository.revokeOldestForUser(userId);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const refreshToken = this.tokenService.generateRefreshToken();
    await this.sessionRepository.create({
      userId,
      refreshTokenHash: this.tokenService.hashRefreshToken(refreshToken),
      expiresAt: this.tokenService.getRefreshExpiresAt(),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await this.userRepository.update(userId, { lastActiveAt: new Date() });

    return {
      ...this.buildAuthResponse(user),
      refreshToken,
    };
  }

  private buildAuthResponse(user: UserWithRoles): AuthResponseDto {
    const roles = this.userRepository.extractRoles(user);
    const permissions = this.userRepository.extractPermissions(user);
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      roles,
      permissions,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        roles,
      },
      accessToken,
      expiresIn: this.tokenService.getAccessExpiresIn(),
    };
  }

  private toProfileDto(user: UserWithRoles): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      roles: this.userRepository.extractRoles(user),
      bio: user.bio,
      city: user.city,
      country: user.country,
      level: user.level,
      experiencePoints: user.experiencePoints,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private ensureNotLocked(email: string): void {
    const authConfig = this.configService.get<AuthConfig>(AUTH_CONFIG_KEY);
    const entry = this.lockouts.get(email);
    if (entry?.lockedUntil && entry.lockedUntil > Date.now()) {
      throw new AccountLockedException();
    }
    if (entry?.lockedUntil && entry.lockedUntil <= Date.now()) {
      this.lockouts.delete(email);
    }
    void authConfig;
  }

  private recordFailedAttempt(email: string): void {
    const authConfig = this.configService.get<AuthConfig>(AUTH_CONFIG_KEY);
    const maxAttempts = authConfig?.maxFailedAttempts ?? 5;
    const lockoutDurationMs = authConfig?.lockoutDurationMs ?? 15 * 60 * 1000;

    const entry = this.lockouts.get(email) ?? { count: 0 };
    entry.count += 1;
    if (entry.count >= maxAttempts) {
      entry.lockedUntil = Date.now() + lockoutDurationMs;
    }
    this.lockouts.set(email, entry);
  }

  private clearFailedAttempts(email: string): void {
    this.lockouts.delete(email);
  }
}
