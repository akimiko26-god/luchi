import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  authConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
} from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, authConfig],
      envFilePath: ['.env', '../../.env'],
    }),
  ],
})
export class AppConfigModule {}
