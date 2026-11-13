import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import request from 'supertest';

describe('Auth endpoints (e2e contract)', () => {
  let app: INestApplication;
  const authService = {
    register: jest.fn().mockResolvedValue({ accessToken: 'token', tokenType: 'Bearer', expiresIn: 3600, user: { id: 1, email: 'a@b.com', fullName: 'Test', role: 'user' } }),
    login: jest.fn().mockResolvedValue({ accessToken: 'token', tokenType: 'Bearer', expiresIn: 3600, user: { id: 1, email: 'a@b.com', fullName: 'Test', role: 'user' } }),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [AuthController], providers: [{ provide: AuthService, useValue: authService }] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });
  afterAll(async () => app.close());
  it('accepts a valid registration payload', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({ email: 'a@b.com', password: 'secret1', fullName: 'Test' }).expect(201).expect(({ body }) => expect(body.accessToken).toBe('token'));
  });
  it('rejects malformed email and unknown fields', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({ email: 'bad', password: 'secret1', fullName: 'Test', role: 'admin' }).expect(400);
  });
  it('accepts valid login payload', async () => {
    await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret1' }).expect(201);
  });
});
