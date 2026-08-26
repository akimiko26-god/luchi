import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  RequirePermission,
  type AuthUser,
} from '../../../iam/presentation/decorators/auth.decorators';
import { UpdateUserDto, UpsertOrganizationDto, UpsertProductDto } from '../../application/dto/admin.dto';
import { AdminApplicationService } from '../../application/services/admin-application.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminApplicationService) {}

  @Get('dashboard')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async dashboard() {
    const data = await this.adminService.getDashboard();
    return { data };
  }

  @Get('reports')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Deeds, rays and transaction reports' })
  async reports() {
    const data = await this.adminService.getReports();
    return { data };
  }

  @Get('users')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'List users' })
  async users() {
    const data = await this.adminService.listUsers();
    return { data };
  }

  @Get('roles')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'List assignable roles' })
  async roles() {
    const data = await this.adminService.listRoles();
    return { data };
  }

  @Patch('users/:id')
  @RequirePermission('user:update:any')
  @ApiOperation({ summary: 'Update user status or role' })
  async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    const data = await this.adminService.updateUser(id, dto);
    return { data };
  }

  @Get('organizations')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'List organizations' })
  async organizations() {
    const data = await this.adminService.listOrganizations();
    return { data };
  }

  @Post('organizations')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Create organization' })
  async createOrganization(@CurrentUser() user: AuthUser, @Body() dto: UpsertOrganizationDto) {
    const data = await this.adminService.createOrganization(user.sub, dto);
    return { data };
  }

  @Patch('organizations/:id')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Update organization' })
  async updateOrganization(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertOrganizationDto) {
    const data = await this.adminService.updateOrganization(id, dto);
    return { data };
  }

  @Get('products')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'List all store products' })
  async products() {
    const data = await this.adminService.listProducts();
    return { data };
  }

  @Post('products')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Create store product' })
  async createProduct(@Body() dto: UpsertProductDto) {
    const data = await this.adminService.createProduct(dto);
    return { data };
  }

  @Patch('products/:id')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Update store product' })
  async updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertProductDto) {
    const data = await this.adminService.updateProduct(id, dto);
    return { data };
  }

  @Get('transactions')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Recent ledger transactions' })
  async transactions() {
    const data = await this.adminService.listTransactions();
    return { data };
  }
}
