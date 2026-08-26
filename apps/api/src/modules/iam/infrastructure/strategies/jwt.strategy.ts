import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONFIG_KEY, type JwtConfig } from '../../../../shared/config/app.config';
import type { AccessTokenPayload } from '../../application/services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtConfig = configService.get<JwtConfig>(JWT_CONFIG_KEY);
    if (!jwtConfig?.secret) {
      throw new Error('JWT configuration is missing');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(payload: AccessTokenPayload): AccessTokenPayload {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
