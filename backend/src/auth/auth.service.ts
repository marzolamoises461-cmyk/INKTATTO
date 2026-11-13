import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(private readonly users: UserService, private readonly jwt: JwtService, private readonly config: ConfigService) {}
  async register(dto: RegisterDto): Promise<AuthResponse> { const user = await this.users.create(dto); return this.buildAuthResponse(user); }
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findOneByEmail(dto.email);
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Credenciales incorrectas');
    return this.buildAuthResponse(user);
  }
  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = Number(this.config.get<string>('JWT_EXPIRATION', '3600'));
    const accessToken = await this.jwt.signAsync(payload, { expiresIn });
    return { accessToken, tokenType: 'Bearer', expiresIn, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } };
  }
}
