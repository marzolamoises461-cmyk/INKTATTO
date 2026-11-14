import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let users: { create: jest.Mock; findOneByEmail: jest.Mock; findById: jest.Mock };
  let jwt: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let config: { get: jest.Mock };

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
    jwt = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      verifyAsync: jest.fn().mockResolvedValue({ sub: account.id, email: account.email, role: account.role }),
    };
    config = { get: jest.fn().mockReturnValue('3600') };
    service = new AuthService(
      users as unknown as UserService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('registers a user and returns the guide token response without password', async () => {
    const result = await service.register({
      email: account.email,
      password: 'secret123',
      fullName: account.fullName,
    });
    expect(users.create).toHaveBeenCalled();
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: account.id, email: account.email, role: account.role },
      { expiresIn: 3600 },
    );
    expect(result.token).toBe('signed.jwt.token');
    expect(result.user).not.toHaveProperty('password');
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
  it('validates a JWT manually and returns the active user', async () => {
    await expect(service.validateToken('valid.token')).resolves.toBe(account);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('valid.token');
    expect(users.findById).toHaveBeenCalledWith(account.id);
  });

  it('rejects an invalid or expired JWT', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('expired'));
    await expect(service.validateToken('expired.token'))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.findById).not.toHaveBeenCalled();
  });

  it('rejects a JWT whose user no longer exists or is inactive', async () => {
    users.findById.mockResolvedValue(null);
    await expect(service.validateToken('valid.token'))
      .rejects.toBeInstanceOf(UnauthorizedException);
    users.findById.mockResolvedValue({ ...account, isActive: false });
    await expect(service.validateToken('valid.token'))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

});