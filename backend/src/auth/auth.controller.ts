import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto): Promise<AuthResponse> { return this.auth.register(dto); }
  @Post('login') login(@Body() dto: LoginDto): Promise<AuthResponse> { return this.auth.login(dto); }
  @Get('profile') @UseGuards(AuthGuard('jwt')) profile(@GetUser() user: User): User { return user; }
}
