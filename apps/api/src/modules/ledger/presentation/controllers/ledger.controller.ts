import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermission, type AuthUser } from '../../../iam/presentation/decorators/auth.decorators';
import { TransferRaysDto } from '../../application/dto/ledger.dto';
import { LedgerApplicationService } from '../../application/services/ledger-application.service';

@ApiTags('rays')
@ApiBearerAuth()
@Controller('rays')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerApplicationService) {}

  @Get('me')
  @RequirePermission('rays:view:own')
  @ApiOperation({ summary: 'Get Rays wallet and history' })
  async getWallet(@CurrentUser() user: AuthUser) {
    const data = await this.ledgerService.getWallet(user.sub);
    return { data };
  }

  @Post('transfer')
  @RequirePermission('rays:transfer')
  @ApiOperation({ summary: 'Transfer Rays to another user' })
  async transfer(@CurrentUser() user: AuthUser, @Body() dto: TransferRaysDto) {
    const data = await this.ledgerService.transfer(user.sub, dto);
    return { data };
  }
}
