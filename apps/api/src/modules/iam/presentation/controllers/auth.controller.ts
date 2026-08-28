import { Body, Controller, Get, Patch, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthApplicationService } from '../../application/services/auth-application.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../../application/dto/auth.dto';
import { TokenService } from '../../application/services/token.service';
import {
  CurrentUser,
  getRequestMeta,
  Public,
  type AuthUser,
  type RequestWithMeta,
} from '../decorators/auth.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthApplicationService,
    private readonly tokenService: TokenService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: RequestWithMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, getRequestMeta(req));
    this.setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _, ...data } = result;
    return { data };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: RequestWithMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, getRequestMeta(req));
    this.setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _, ...data } = result;
    return { data };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: RequestWithMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieName = this.tokenService.getRefreshCookieName();
    const refreshToken = req.cookies?.[cookieName] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const result = await this.authService.refresh(refreshToken, getRequestMeta(req));
    this.setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _, ...data } = result;
    return { data };
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Req() req: RequestWithMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieName = this.tokenService.getRefreshCookieName();
    const refreshToken = req.cookies?.[cookieName] as string | undefined;
    await this.authService.logout(refreshToken, user.sub, getRequestMeta(req));
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie(cookieName, {
      path: '/api/v1/auth',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
    });
    return { data: { success: true } };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    const cookieName = this.tokenService.getRefreshCookieName();
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/api/v1/auth',
      maxAge: this.tokenService.getRefreshCookieMaxAge(),
    });
  }
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthApplicationService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: AuthUser, @Req() req: RequestWithMeta) {
    void req;
    const profile = await this.authService.getProfile(user.sub);
    return { data: profile };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
    @Req() req: RequestWithMeta,
  ) {
    const profile = await this.authService.updateProfile(user.sub, dto, getRequestMeta(req));
    return { data: profile };
  }
}
