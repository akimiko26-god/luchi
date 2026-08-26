import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { AdminApplicationService } from './application/services/admin-application.service';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
  imports: [LedgerModule],
  controllers: [AdminController],
  providers: [AdminApplicationService],
})
export class AdminModule {}
