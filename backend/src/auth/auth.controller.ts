import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.auth.login(dto);
  }

  @Post('password/forgot')
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.auth.forgotPassword(dto);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.auth.resetPassword(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@GetUser() user: User): { user: User } {
    return { user };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto): Promise<{ user: User }> {
    return { user: await this.auth.updateProfile(user.id, dto) };
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @GetUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.auth.changePassword(user.id, dto);
  }
}
