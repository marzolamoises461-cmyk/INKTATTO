import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { Repository, In } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/user/entities/user.entity';

const runDatabaseE2e = process.env.RUN_DB_E2E === 'true';

(runDatabaseE2e ? describe : describe.skip)('API real con MySQL (integration e2e)', () => {
  let app: INestApplication | null = null;
  let users: Repository<User> | null = null;
  let customerToken = '';
  let secondCustomerToken = '';
  let adminToken = '';
  let bookingId = 0;

  const suffix = `${Date.now()}-${process.pid}`;
  const customerEmail = `cliente-${suffix}@inktatto.test`;
  const secondEmail = `cliente-dos-${suffix}@inktatto.test`;
  const adminEmail = `admin-${suffix}@inktatto.test`;
  const password = 'TestPassword-2026!';

  beforeAll(async () => {
    const database = process.env.DB_DATABASE ?? '';
    if (!/_test$/i.test(database)) {
      throw new Error(
        'Las pruebas MySQL reales solo pueden ejecutarse contra una base cuyo nombre termine en _test. No uses inktatto_db.',
      );
    }

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    await app.init();

    users = app.get<Repository<User>>(getRepositoryToken(User));
    const admin = users!.create({
      email: adminEmail,
      password: await bcrypt.hash(password, 10),
      fullName: 'Administrador de pruebas',
      role: 'admin',
      isActive: true,
    });
    await users!.save(admin);
  });

  afterAll(async () => {
    if (users) {
      await users.delete({ email: In([customerEmail, secondEmail, adminEmail]) });
    }
    if (app) await app.close();
  });

  it('rechaza rutas protegidas sin token', async () => {
    await request(app!.getHttpServer()).get('/api/bookings/mine').expect(401);
    await request(app!.getHttpServer()).get('/api/users').expect(401);
  });

  it('registra clientes sin permitir autoasignarse el rol admin', async () => {
    const registration = await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({ email: customerEmail, password, fullName: 'Cliente de pruebas' })
      .expect(201);

    customerToken = registration.body.token;
    expect(registration.body.user.role).toBe('user');
    expect(registration.body.user).not.toHaveProperty('password');

    await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: `escalamiento-${suffix}@inktatto.test`,
        password,
        fullName: 'Intento de escalamiento',
        role: 'admin',
      })
      .expect(400);

    const login = await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password })
      .expect(200);
    expect(login.body.token).toBeTruthy();

    const profile = await request(app!.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(profile.body.user.email).toBe(customerEmail);
    expect(profile.body.user).not.toHaveProperty('password');
  });

  it('limita las reservas al propietario y respeta el estado pendiente', async () => {
    const second = await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({ email: secondEmail, password, fullName: 'Segundo cliente' })
      .expect(201);
    secondCustomerToken = second.body.token;

    const created = await request(app!.getHttpServer())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        artist: 'artist-one',
        date: '2099-12-31',
        time: '10:00',
        bodyArea: 'Brazo',
        size: 'Mediano',
        idea: 'Diseño de prueba para validar la persistencia real en MySQL.',
      })
      .expect(201);

    bookingId = created.body.id;
    expect(created.body.status).toBe('pending');

    const mine = await request(app!.getHttpServer())
      .get('/api/bookings/mine')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(mine.body.map((item: { id: number }) => item.id)).toContain(bookingId);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${secondCustomerToken}`)
      .expect(403);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('cancelled'));

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('permite al admin gestionar usuarios y reservas sin exponer contraseñas', async () => {
    const login = await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = login.body.token;

    await request(app!.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    const userList = await request(app!.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(userList.body.some((user: { email: string }) => user.email === customerEmail)).toBe(true);
    expect(userList.body.every((user: { password?: string }) => !('password' in user))).toBe(true);

    await request(app!.getHttpServer())
      .get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        const booking = body.find((item: { id: number }) => item.id === bookingId);
        expect(booking).toBeTruthy();
        expect(booking.user).not.toHaveProperty('password');
      });

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('confirmed'));
  });

  it('invalida el token cuando la cuenta se desactiva', async () => {
    await users!.update({ email: customerEmail }, { isActive: false });

    await request(app!.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(401);
  });
});
