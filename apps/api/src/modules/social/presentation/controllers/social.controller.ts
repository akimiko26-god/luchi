import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../../iam/presentation/decorators/auth.decorators';
import { CreateCommentDto, CreatePostDto } from '../../application/dto/social.dto';
import { SocialApplicationService } from '../../application/services/social-application.service';

@ApiTags('social')
@ApiBearerAuth()
@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialApplicationService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Chronological feed' })
  async feed(@CurrentUser() user: AuthUser) {
    const data = await this.socialService.getFeed(user.sub);
    return { data };
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create a post' })
  async createPost(@CurrentUser() user: AuthUser, @Body() dto: CreatePostDto) {
    const data = await this.socialService.createPost(user.sub, dto);
    return { data };
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  async like(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.socialService.toggleLike(user.sub, id);
    return { data };
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Comment on a post' })
  async comment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const data = await this.socialService.addComment(user.sub, id, dto);
    return { data };
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Toggle like on a comment' })
  async likeComment(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.socialService.toggleCommentLike(user.sub, id);
    return { data };
  }
}
