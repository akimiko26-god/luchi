import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { CabinetApplicationService } from './application/services/cabinet-application.service';
import { CabinetController } from './presentation/controllers/cabinet.controller';

@Module({
  imports: [LedgerModule],
  controllers: [CabinetController],
  providers: [CabinetApplicationService],
})
export class CabinetModule {}
