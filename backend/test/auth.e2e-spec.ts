import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';

describe('Auth endpoints (e2e contract)', () => {
  let app: INestApplication;
  const authService = {
    register: jest.fn().mockResolvedValue({ message: 'Revisa tu correo para verificar la cuenta antes de iniciar sesión.' }),
    verifyEmail: jest.fn().mockResolvedValue({ message: 'Correo verificado. Ya puedes iniciar sesión.' }),
    resendVerificationEmail: jest.fn().mockResolvedValue({ message: 'Si el correo corresponde a una cuenta pendiente, recibirás un nuevo enlace de verificación.' }),
    login: jest.fn().mockResolvedValue({
      token: 'token',
      user: { id: 1, email: 'a@b.com', fullName: 'Test', role: 'user' },
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('registers an account without issuing a session before email verification', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'SecurePassword-2026!', fullName: 'Test' })
      .expect(201)
      .expect(({ body }) => expect(body.message).toMatch(/verificar la cuenta/));

    await request(app.getHttpServer())
      .post('/api/auth/email/verify')
      .send({ token: 'valid-verification-token' })
      .expect(201)
      .expect(({ body }) => expect(body.message).toContain('Correo verificado'));
  });

  it('rejects malformed email and unknown fields', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'bad', password: 'SecurePassword-2026!', fullName: 'Test', role: 'admin' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'weak@b.com', password: 'short', fullName: 'Test' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'weak-complexity@b.com', password: 'WeakPassword2026', fullName: 'Test' })
      .expect(400);
  });

  it('logs in with a valid payload and returns 200 OK', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'SecurePassword-2026!' })
      .expect(200)
      .expect(({ body }) => expect(body.token).toBe('token'));
  });

  it('limits repeated login attempts', async () => {
    for (let attempt = 0; attempt < 9; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'a@b.com', password: 'SecurePassword-2026!' })
        .expect(200);
    }

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'SecurePassword-2026!' })
      .expect(429);
  });
});
