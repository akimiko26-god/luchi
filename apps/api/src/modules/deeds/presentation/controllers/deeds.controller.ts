import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  RequirePermission,
  type AuthUser,
} from '../../../iam/presentation/decorators/auth.decorators';
import { CreateTaskDto, ReviewDeedDto, SubmitDeedDto } from '../../application/dto/deeds.dto';
import { DeedsApplicationService } from '../../application/services/deeds-application.service';

@ApiTags('deeds')
@ApiBearerAuth()
@Controller('deeds')
export class DeedsController {
  constructor(private readonly deedsService: DeedsApplicationService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'List active good-deed tasks' })
  async tasks() {
    const data = await this.deedsService.listTasks();
    return { data };
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Task details' })
  async task(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.deedsService.getTask(id);
    return { data };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Deed categories' })
  async categories() {
    const data = await this.deedsService.listCategories();
    return { data };
  }

  @Post('tasks')
  @RequirePermission('admin:dashboard')
  @ApiOperation({ summary: 'Create a good-deed task' })
  async createTask(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) {
    const data = await this.deedsService.createTask(user.sub, dto);
    return { data };
  }

  @Get('submissions/me')
  @ApiOperation({ summary: 'My deed submissions' })
  async mine(@CurrentUser() user: AuthUser) {
    const data = await this.deedsService.listMySubmissions(user.sub);
    return { data };
  }

  @Get('confirmations/me')
  @ApiOperation({ summary: 'Pending help confirmations' })
  async myConfirmations(@CurrentUser() user: AuthUser) {
    const data = await this.deedsService.listPendingConfirmations(user.sub);
    return { data };
  }

  @Post('confirmations/:id/confirm')
  @ApiOperation({ summary: 'Confirm that help was received' })
  async confirm(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.deedsService.respondConfirmation(user.sub, id, true);
    return { data };
  }

  @Post('confirmations/:id/deny')
  @ApiOperation({ summary: 'Deny that help was received' })
  async deny(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.deedsService.respondConfirmation(user.sub, id, false);
    return { data };
  }

  @Post('submissions')
  @RequirePermission('deed:submit')
  @ApiOperation({ summary: 'Submit proof for a task' })
  async submit(@CurrentUser() user: AuthUser, @Body() dto: SubmitDeedDto) {
    const data = await this.deedsService.submit(user.sub, dto);
    return { data };
  }

  @Get('queue')
  @RequirePermission('moderation:review')
  @ApiOperation({ summary: 'Moderation queue' })
  async queue() {
    const data = await this.deedsService.listQueue();
    return { data };
  }

  @Post('queue/:id/approve')
  @RequirePermission('moderation:review')
  @ApiOperation({ summary: 'Approve submission and credit Rays' })
  async approve(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReviewDeedDto,
  ) {
    const data = await this.deedsService.approve(id, user.sub, body.override === true);
    return { data };
  }

  @Post('queue/:id/reject')
  @RequirePermission('moderation:review')
  @ApiOperation({ summary: 'Reject submission' })
  async reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReviewDeedDto,
  ) {
    const data = await this.deedsService.reject(id, user.sub, body);
    return { data };
  }
}
