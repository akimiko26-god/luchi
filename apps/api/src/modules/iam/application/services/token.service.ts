import { createHash, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONFIG_KEY, type AuthConfig, JWT_CONFIG_KEY, type JwtConfig } from '../../../../shared/config/app.config';
import { REFRESH_TOKEN_BYTES } from '../../domain/constants/iam.constants';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    const jwtConfig = this.getJwtConfig();
    return this.jwtService.sign(payload, { expiresIn: jwtConfig.accessTtl });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token);
  }

  generateRefreshToken(): string {
    return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getRefreshExpiresAt(): Date {
    const jwtConfig = this.getJwtConfig();
    return new Date(Date.now() + jwtConfig.refreshTtl * 1000);
  }

  getAccessExpiresIn(): number {
    return this.getJwtConfig().accessTtl;
  }

  getRefreshCookieName(): string {
    return this.configService.get<AuthConfig>(AUTH_CONFIG_KEY)?.refreshCookieName ?? 'refresh_token';
  }

  getRefreshCookieMaxAge(): number {
    return this.getJwtConfig().refreshTtl * 1000;
  }

  private getJwtConfig(): JwtConfig {
    const config = this.configService.get<JwtConfig>(JWT_CONFIG_KEY);
    if (!config) {
      throw new Error('JWT configuration is missing');
    }
    return config;
  }
}
