import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  RequirePermission,
  type AuthUser,
} from '../../../iam/presentation/decorators/auth.decorators';
import { PurchaseDto } from '../../application/dto/store.dto';
import { StoreApplicationService } from '../../application/services/store-application.service';

@ApiTags('store')
@ApiBearerAuth()
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreApplicationService) {}

  @Get('products')
  @ApiOperation({ summary: 'Store catalog' })
  async products() {
    const data = await this.storeService.listProducts();
    return { data };
  }

  @Get('orders/me')
  @ApiOperation({ summary: 'My orders' })
  async orders(@CurrentUser() user: AuthUser) {
    const data = await this.storeService.myOrders(user.sub);
    return { data };
  }

  @Post('orders')
  @RequirePermission('store:purchase')
  @ApiOperation({ summary: 'Buy a product for Rays' })
  async purchase(@CurrentUser() user: AuthUser, @Body() dto: PurchaseDto) {
    const data = await this.storeService.purchase(user.sub, dto);
    return { data };
  }
}
