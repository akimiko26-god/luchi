import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { DeedsApplicationService } from './application/services/deeds-application.service';
import { DeedsController } from './presentation/controllers/deeds.controller';

@Module({
  imports: [LedgerModule],
  controllers: [DeedsController],
  providers: [DeedsApplicationService],
  exports: [DeedsApplicationService],
})
export class DeedsModule {}
