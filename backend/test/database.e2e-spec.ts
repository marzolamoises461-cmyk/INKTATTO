import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { Repository, In } from 'typeorm';
import request from 'supertest';
import { User } from '../src/user/entities/user.entity';
import { Artist } from '../src/artists/entities/artist.entity';
import { ReferenceImageStorageService } from '../src/bookings/reference-image-storage.service';

const runDatabaseE2e = process.env.RUN_DB_E2E === 'true';

(runDatabaseE2e ? describe : describe.skip)('API real con MySQL (integration e2e)', () => {
  let app: INestApplication | null = null;
  let users: Repository<User> | null = null;
  let customerToken = '';
  let secondCustomerToken = '';
  let adminToken = '';
  let bookingOwnerToken = '';
  let artistId = 0;
  let blockId = 0;
  let bookingId = 0;
  let workflowBookingId = 0;

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

    const { AppModule } = await import('../src/app.module');
    let imageId = 0;
    const imageContent = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const imageStorage = {
      upload: jest.fn(async (file: Express.Multer.File) => {
        imageId += 1;
        return {
          objectKey: `booking-references/e2e-${imageId}.png`,
          storageUrl: `https://storage.example/e2e-${imageId}.png`,
          originalName: file.originalname,
          mimeType: 'image/png',
          sizeBytes: file.size,
        };
      }),
      remove: jest.fn().mockResolvedValue(undefined),
      download: jest.fn().mockResolvedValue(imageContent),
    };
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ReferenceImageStorageService)
      .useValue(imageStorage)
      .compile();
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

    const login = await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = login.body.token;
    const artists = app!.get<Repository<Artist>>(getRepositoryToken(Artist));
    artistId = (await artists.findOneByOrFail({ slug: 'faver' })).id;
  });

  afterAll(async () => {
    if (app && adminToken && artistId && blockId) {
      await request(app.getHttpServer())
        .delete(`/api/artists/${artistId}/blocks/${blockId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    if (app && adminToken && artistId) {
      await request(app.getHttpServer())
        .put(`/api/artists/${artistId}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ windows: [] });
    }
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

  it('bloquea reservas simultáneas del mismo artista y limita el acceso a imágenes', async () => {
    const second = await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({ email: secondEmail, password, fullName: 'Segundo cliente' })
      .expect(201);
    secondCustomerToken = second.body.token;

    await request(app!.getHttpServer())
      .put(`/api/artists/${artistId}/schedule`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        windows: Array.from({ length: 7 }, (_, weekday) => ({
          weekday, opensAt: '09:00', closesAt: '18:00',
        })),
      })
      .expect(200);
    const savedSchedule = await request(app!.getHttpServer())
      .get(`/api/artists/${artistId}/schedule`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(savedSchedule.body).toHaveLength(7);
    await request(app!.getHttpServer())
      .get(`/api/artists/${artistId}/schedule`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    const createdBlock = await request(app!.getHttpServer())
      .post(`/api/artists/${artistId}/blocks`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ date: '2099-12-30', reason: 'Vacaciones de prueba' })
      .expect(201);
    blockId = createdBlock.body.id;
    const savedBlocks = await request(app!.getHttpServer())
      .get(`/api/artists/${artistId}/blocks`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(savedBlocks.body.some((block: { id: number }) => block.id === blockId)).toBe(true);
    await request(app!.getHttpServer())
      .delete(`/api/artists/${artistId}/blocks/${blockId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    blockId = 0;

    const available = await request(app!.getHttpServer())
      .get('/api/artists/faver/availability?date=2099-12-31&durationMinutes=60')
      .expect(200);
    expect(available.body.slots).toContain('10:00');

    const submit = (token: string) => request(app!.getHttpServer())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .field('artist', 'faver')
      .field('date', '2099-12-31')
      .field('time', '10:00')
      .field('bodyArea', 'Brazo')
      .field('size', 'Mediano')
      .field('idea', 'Diseño de prueba para validar la persistencia real en MySQL.')
      .attach('images', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), {
        filename: 'referencia.png',
        contentType: 'image/png',
      });
    const concurrent = await Promise.all([submit(customerToken), submit(secondCustomerToken)]);
    expect(concurrent.map((response) => response.status).sort()).toEqual([201, 409]);
    const created = concurrent.find((response) => response.status === 201)!;
    bookingOwnerToken = concurrent.indexOf(created) === 0 ? customerToken : secondCustomerToken;
    bookingId = created.body.id;
    expect(created.body.status).toBe('pending');

    const images = await request(app!.getHttpServer())
      .get(`/api/bookings/${bookingId}/images`)
      .set('Authorization', `Bearer ${bookingOwnerToken}`)
      .expect(200);
    expect(images.body).toHaveLength(1);
    expect(images.body[0]).not.toHaveProperty('storageUrl');
    await request(app!.getHttpServer())
      .get(`/api/bookings/${bookingId}/images/${images.body[0].id}`)
      .set('Authorization', `Bearer ${bookingOwnerToken === customerToken ? secondCustomerToken : customerToken}`)
      .expect(403);
    await request(app!.getHttpServer())
      .get(`/api/bookings/${bookingId}/images/${images.body[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect('Content-Type', 'image/png');

    const mine = await request(app!.getHttpServer())
      .get('/api/bookings/mine')
      .set('Authorization', `Bearer ${bookingOwnerToken}`)
      .expect(200);
    expect(mine.body.map((item: { id: number }) => item.id)).toContain(bookingId);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${bookingOwnerToken === customerToken ? secondCustomerToken : customerToken}`)
      .expect(403);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${bookingOwnerToken}`)
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('cancelled'));

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${bookingOwnerToken}`)
      .expect(403);
  });

  it('permite al admin gestionar usuarios y reservas sin exponer contraseñas', async () => {
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

    const workflowBooking = await request(app!.getHttpServer())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('artist', 'faver')
      .field('date', '2099-12-31')
      .field('time', '11:00')
      .field('bodyArea', 'Brazo')
      .field('size', 'Mediano')
      .field('idea', 'Una segunda cita para validar las transiciones de estado.')
      .attach('images', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), {
        filename: 'referencia.png',
        contentType: 'image/png',
      })
      .expect(201);
    workflowBookingId = workflowBooking.body.id;

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
      .patch(`/api/bookings/${workflowBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' })
      .expect(400);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${workflowBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'quoted' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('quoted'));

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${workflowBookingId}/status`)
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
