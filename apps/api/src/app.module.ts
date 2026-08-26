import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppConfigModule } from './shared/config/config.module';
import { AuditModule } from './shared/infrastructure/audit/audit.module';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { CorrelationIdMiddleware } from './shared/presentation/middleware/correlation-id.middleware';
import { HealthModule } from './modules/health/health.module';
import { IamModule } from './modules/iam/iam.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { SocialModule } from './modules/social/social.module';
import { DeedsModule } from './modules/deeds/deeds.module';
import { StoreModule } from './modules/store/store.module';
import { CabinetModule } from './modules/cabinet/cabinet.module';
import { AdminModule } from './modules/admin/admin.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuditModule,
    EventEmitterModule.forRoot(),
    HealthModule,
    IamModule,
    LedgerModule,
    SocialModule,
    DeedsModule,
    StoreModule,
    CabinetModule,
    AdminModule,
    MediaModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
