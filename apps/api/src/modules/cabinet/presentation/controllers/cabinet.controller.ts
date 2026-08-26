import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../../iam/presentation/decorators/auth.decorators';
import { CabinetApplicationService } from '../../application/services/cabinet-application.service';

@ApiTags('cabinet')
@ApiBearerAuth()
@Controller('cabinet')
export class CabinetController {
  constructor(private readonly cabinetService: CabinetApplicationService) {}

  @Get('me')
  @ApiOperation({ summary: 'User cabinet overview' })
  async me(@CurrentUser() user: AuthUser) {
    const data = await this.cabinetService.getOverview(user.sub);
    if (!data) {
      throw new NotFoundException('User not found');
    }
    return { data };
  }
}
