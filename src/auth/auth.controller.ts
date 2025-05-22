import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { ApiBody, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { AuthProviderGuard } from './guards/provider.guard';
import { ProviderService } from './provider/provider.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../prisma/__generated__/index';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService
  ) { }

  // @Recaptcha()

  @Post('register')
  @HttpCode(200)
  @ApiBody({
    type: RegisterDto,
    description: 'Json structure for user object',
  })
  public async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // @Recaptcha()
  @ApiCookieAuth('connect.sid')
  @Post('login')
  @HttpCode(200)
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.authService.login(req, dto);
  }

  @Get('oauth/callback/:provider')
  @UseGuards(AuthProviderGuard)
  @HttpCode(200)
  public async callback(@Param('provider') provider: string, @Req() req: Request, @Res({ passthrough: true }) res: Response, @Query('code') code: string) {
    if (!code) throw new BadRequestException('Code not found');

    await this.authService.extractProfileFromCode(req, provider, code);
    return res.redirect(`${this.configService.getOrThrow<string>('ALLOWED_ORIGINS')}/dashboard/settings`);
  }

  @Get('oauth/connect/:provider')
  @UseGuards(AuthProviderGuard)
  @HttpCode(200)
  public async connect(@Param('provider') provider: string) {
    const providerInstance = this.providerService.findByService(provider);
    return {
      url: providerInstance?.getAuthUrl(),
    }
  }

  @Post('logout')
  @HttpCode(200)
  public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
