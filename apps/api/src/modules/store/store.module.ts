import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { StoreApplicationService } from './application/services/store-application.service';
import { StoreController } from './presentation/controllers/store.controller';

@Module({
  imports: [LedgerModule],
  controllers: [StoreController],
  providers: [StoreApplicationService],
  exports: [StoreApplicationService],
})
export class StoreModule {}
