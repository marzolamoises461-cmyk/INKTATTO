import {
  BadRequestException, Injectable, ServiceUnavailableException, UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { EmailService } from '../notifications/email.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { ResendVerificationEmailDto } from './dto/verify-email.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
    private readonly dataSource: DataSource,
    private readonly email: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    this.assertEmailDeliveryConfigured();
    const user = await this.users.create(dto, false);
    await this.sendVerificationEmail(user);
    return { message: 'Revisa tu correo para verificar la cuenta antes de iniciar sesión.' };
  }

  async resendVerificationEmail(dto: ResendVerificationEmailDto): Promise<{ message: string }> {
    this.assertEmailDeliveryConfigured();
    const user = await this.users.findOneByEmail(dto.email);
    if (user && !user.isActive) await this.sendVerificationEmail(user);
    return { message: 'Si el correo corresponde a una cuenta pendiente, recibirás un nuevo enlace de verificación.' };
  }

  async verifyEmail(tokenValue: string): Promise<{ message: string }> {
    const tokenHash = createHash('sha256').update(tokenValue).digest('hex');
    await this.dataSource.transaction(async (manager) => {
      const token = await manager.getRepository(EmailVerificationToken).findOne({
        where: { tokenHash },
        lock: { mode: 'pessimistic_write' },
      });
      if (!token || token.usedAt || token.expiresAt <= new Date()) {
        throw new BadRequestException('El enlace de verificación no es válido o expiró.');
      }

      const user = await manager.findOne(User, {
        where: { id: token.userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user || user.isActive) {
        throw new BadRequestException('El enlace de verificación no es válido o expiró.');
      }

      const now = new Date();
      token.usedAt = now;
      await manager.save(EmailVerificationToken, token);
      await manager.update(User, { id: user.id }, { isActive: true });
    });
    return { message: 'Correo verificado. Ya puedes iniciar sesión.' };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    return this.users.update(userId, { fullName: dto.fullName, email: dto.email });
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findOneByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return this.buildAuthResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL')?.trim();
    if (!frontendUrl || !this.email.isConfigured()) {
      throw new ServiceUnavailableException(
        'La recuperación requiere FRONTEND_URL y una configuración SMTP válida.',
      );
    }

    const user = await this.users.findOneByEmail(dto.email);
    if (!user || !user.isActive) {
      return { message: 'Si el correo corresponde a una cuenta activa, recibirás instrucciones para recuperar la contraseña.' };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await this.dataSource.transaction(async (manager) => {
      const currentUser = await manager.findOne(User, {
        where: { id: user.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!currentUser || !currentUser.isActive) {
        throw new UnauthorizedException('La cuenta no está disponible.');
      }
      const now = new Date();
      await manager.update(PasswordResetToken, { userId: user.id, usedAt: IsNull() }, { usedAt: now });
      await manager.save(PasswordResetToken, {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
        usedAt: null,
      });
    });

    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('token', rawToken);
    try {
      await this.email.send({
        recipientEmail: user.email,
        subject: 'Recupera tu contraseña de INKTATTO',
        textBody: [
          `Hola ${user.fullName},`,
          '',
          'Recibimos una solicitud para cambiar la contraseña de tu cuenta.',
          `Usa este enlace dentro de los próximos 60 minutos: ${resetUrl.toString()}`,
          '',
          'Si no solicitaste este cambio, puedes ignorar este correo.',
        ].join('\n'),
      });
    } catch (error) {
      await this.resetTokens.delete({ tokenHash });
      throw error;
    }

    return { message: 'Si el correo corresponde a una cuenta activa, recibirás instrucciones para recuperar la contraseña.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    await this.dataSource.transaction(async (manager) => {
      const token = await manager.getRepository(PasswordResetToken).findOne({
        where: { tokenHash },
        lock: { mode: 'pessimistic_write' },
      });
      if (!token || token.usedAt || token.expiresAt <= new Date()) {
        throw new BadRequestException('El enlace de recuperación no es válido o expiró.');
      }

      const user = await manager.findOne(User, { where: { id: token.userId } });
      if (!user || !user.isActive) {
        throw new BadRequestException('El enlace de recuperación no es válido o expiró.');
      }

      token.usedAt = new Date();
      await manager.save(PasswordResetToken, token);
      await manager.update(User, { id: user.id }, { password: await bcrypt.hash(dto.password, 10) });
    });
    return { message: 'La contraseña se actualizó. Ya puedes iniciar sesión.' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const fullUser = await this.users.findById(userId);
    if (!fullUser || !fullUser.isActive) throw new UnauthorizedException('La cuenta no está disponible.');
    const credentials = await this.users.findOneByEmail(fullUser.email);
    if (!credentials || !(await bcrypt.compare(dto.currentPassword, credentials.password))) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }
    const now = new Date();
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, { id: userId }, { password: passwordHash });
      await manager.update(PasswordResetToken, { userId, usedAt: IsNull() }, { usedAt: now });
    });
    return { message: 'La contraseña se actualizó correctamente.' };
  }

  private assertEmailDeliveryConfigured(): void {
    if (!this.config.get<string>('FRONTEND_URL')?.trim() || !this.email.isConfigured()) {
      throw new ServiceUnavailableException(
        'La verificación de cuenta requiere FRONTEND_URL y una configuración SMTP válida.',
      );
    }
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const currentUser = await manager.findOne(User, {
        where: { id: user.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!currentUser || currentUser.isActive) {
        throw new BadRequestException('La cuenta ya no requiere verificación.');
      }
      await manager.update(
        EmailVerificationToken,
        { userId: user.id, usedAt: IsNull() },
        { usedAt: now },
      );
      await manager.save(EmailVerificationToken, {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        usedAt: null,
      });
    });

    const verifyUrl = new URL('/verify-email', this.config.getOrThrow<string>('FRONTEND_URL'));
    verifyUrl.searchParams.set('token', rawToken);
    try {
      await this.email.send({
        recipientEmail: user.email,
        subject: 'Verifica tu correo de INKTATTO',
        textBody: [
          `Hola ${user.fullName},`,
          '',
          'Confirma que esta dirección de correo te pertenece para activar tu cuenta.',
          `El enlace vence en 24 horas: ${verifyUrl.toString()}`,
        ].join('\n'),
      });
    } catch (error) {
      await this.dataSource.transaction(async (manager) => {
        await manager.update(EmailVerificationToken, { tokenHash }, { usedAt: new Date() });
      });
      throw error;
    }
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const expiresIn = Number(this.config.get<string>('JWT_EXPIRATION', '3600'));
    const token = await this.jwt.signAsync(payload, { expiresIn });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
