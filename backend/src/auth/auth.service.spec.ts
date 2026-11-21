import { BadRequestException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn().mockResolvedValue('new-hash') }));

describe('AuthService', () => {
  let service: AuthService;
  let users: {
    create: jest.Mock;
    findOneByEmail: jest.Mock;
    findById: jest.Mock;
  };
  let jwt: { signAsync: jest.Mock };
  let config: { get: jest.Mock; getOrThrow: jest.Mock };
  let resetTokens: {
    delete: jest.Mock;
  };
  let manager: {
    getRepository: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };
  let email: { isConfigured: jest.Mock; send: jest.Mock };

  const account = {
    id: 7,
    email: 'cliente@ejemplo.com',
    password: 'hashed-password',
    fullName: 'Cliente Prueba',
    role: 'user',
    isActive: true,
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();
    users = {
      create: jest.fn().mockResolvedValue(account),
      findOneByEmail: jest.fn().mockResolvedValue(account),
      findById: jest.fn().mockResolvedValue(account),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    config = {
      get: jest.fn((key: string) => key === 'FRONTEND_URL' ? 'https://inktattoo.example' : '3600'),
      getOrThrow: jest.fn((key: string) => key === 'FRONTEND_URL' ? 'https://inktattoo.example' : '3600'),
    };
    resetTokens = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    manager = {
      getRepository: jest.fn().mockReturnValue({ findOne: jest.fn().mockResolvedValue(null) }),
      findOne: jest.fn().mockResolvedValue(account),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    };
    dataSource = {
      transaction: jest.fn(async (callback: (transactionManager: typeof manager) => unknown) => callback(manager)),
    };
    email = {
      isConfigured: jest.fn().mockReturnValue(true),
      send: jest.fn().mockResolvedValue(undefined),
    };
    service = new AuthService(
      users as unknown as UserService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
      resetTokens as never,
      dataSource as never,
      email as never,
    );
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('creates an inactive account and sends a one-time email verification link', async () => {
    users.create.mockResolvedValue({ ...account, isActive: false });
    manager.findOne.mockResolvedValue({ ...account, isActive: false });
    const result = await service.register({
      email: account.email,
      password: 'SecurePassword-2026!',
      fullName: account.fullName,
    });
    expect(users.create).toHaveBeenCalledWith(expect.objectContaining({
      email: account.email,
      password: 'SecurePassword-2026!',
    }), false);
    expect(manager.save).toHaveBeenCalledWith(EmailVerificationToken, expect.objectContaining({
      userId: account.id,
      tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      expiresAt: expect.any(Date),
    }));
    expect(email.send).toHaveBeenCalledWith(expect.objectContaining({
      recipientEmail: account.email,
      textBody: expect.stringContaining('https://inktattoo.example/verify-email?token='),
    }));
    expect(result.message).toContain('verificar la cuenta');
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('activates a pending account only when its verification token is valid', async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue({
        userId: account.id,
        tokenHash: 'stored-hash',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    };
    manager.getRepository.mockReturnValue(repository);
    manager.findOne.mockResolvedValue({ ...account, isActive: false });

    await service.verifyEmail('raw-token');

    expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: { tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) },
      lock: { mode: 'pessimistic_write' },
    }));
    expect(manager.update).toHaveBeenCalledWith(User, { id: account.id }, { isActive: true });
  });

  it('rejects invalid or expired verification tokens', async () => {
    manager.getRepository.mockReturnValue({ findOne: jest.fn().mockResolvedValue(null) });

    await expect(service.verifyEmail('unknown-token')).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('does not create accounts when SMTP is unavailable', async () => {
    email.isConfigured.mockReturnValue(false);

    await expect(service.register({
      email: account.email,
      password: 'SecurePassword-2026!',
      fullName: account.fullName,
    })).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(users.create).not.toHaveBeenCalled();
  });

  it('rejects invalid credentials', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login({ email: account.email, password: 'wrongpass' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects inactive accounts without disclosing account status', async () => {
    users.findOneByEmail.mockResolvedValue({ ...account, isActive: false });
    await expect(service.login({ email: account.email, password: 'secret123' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('stores only a hash for a time-limited password reset and sends the raw token by email', async () => {
    await service.forgotPassword({ email: account.email });

    expect(manager.save).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      userId: account.id,
      tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      expiresAt: expect.any(Date),
    }));
    expect(email.send).toHaveBeenCalledWith(expect.objectContaining({
      recipientEmail: account.email,
      textBody: expect.stringContaining('https://inktattoo.example/reset-password?token='),
    }));
    expect(JSON.stringify(manager.save.mock.calls[0][1])).not.toContain('token=');
  });

  it('does not claim password recovery is sent when SMTP is unavailable', async () => {
    email.isConfigured.mockReturnValue(false);

    await expect(service.forgotPassword({ email: account.email }))
      .rejects.toThrow('La recuperación requiere FRONTEND_URL y una configuración SMTP válida.');
    expect(email.send).not.toHaveBeenCalled();
  });

  it('rejects an expired or consumed password reset token', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue({
      tokenHash: 'expired-hash',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
    }) };
    manager.getRepository.mockReturnValue(repository);

    await expect(service.resetPassword({ token: 'token', password: 'secure-password' }))
      .rejects.toThrow('El enlace de recuperación no es válido o expiró.');
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('checks the current password before allowing a password change', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.changePassword(7, {
      currentPassword: 'wrong-password',
      newPassword: 'secure-password',
    })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });
});
