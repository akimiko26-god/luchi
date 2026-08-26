import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { LedgerApplicationService } from './application/services/ledger-application.service';
import { LedgerController } from './presentation/controllers/ledger.controller';

@Module({
  imports: [IamModule],
  controllers: [LedgerController],
  providers: [LedgerApplicationService],
  exports: [LedgerApplicationService],
})
export class LedgerModule {}
