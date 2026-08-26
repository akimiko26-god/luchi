import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_CONFIG_KEY, type JwtConfig } from '../../shared/config/app.config';
import { AuthApplicationService } from './application/services/auth-application.service';
import { PasswordHasherService } from './application/services/password-hasher.service';
import { TokenService } from './application/services/token.service';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController, UsersController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PermissionGuard } from './presentation/guards/permission.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>(JWT_CONFIG_KEY);
        if (!jwtConfig?.secret) {
          throw new Error('JWT configuration is missing');
        }
        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtConfig.accessTtl },
        };
      },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthApplicationService,
    PasswordHasherService,
    TokenService,
    UserRepository,
    SessionRepository,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
  exports: [AuthApplicationService, UserRepository, TokenService],
})
export class IamModule {}
