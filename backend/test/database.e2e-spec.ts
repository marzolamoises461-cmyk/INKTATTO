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
import { EmailService } from '../src/notifications/email.service';
import { ContactMessage } from '../src/contact/entities/contact-message.entity';
import { Booking } from '../src/bookings/entities/booking.entity';

const runDatabaseE2e = process.env.RUN_DB_E2E === 'true';

(runDatabaseE2e ? describe : describe.skip)('API real con MySQL (integration e2e)', () => {
  let app: INestApplication | null = null;
  let users: Repository<User> | null = null;
  let bookings: Repository<Booking> | null = null;
  let contactMessages: Repository<ContactMessage> | null = null;
  let customerToken = '';
  let secondCustomerToken = '';
  let adminToken = '';
  let bookingOwnerToken = '';
  let artistId = 0;
  let blockId = 0;
  let bookingId = 0;
  let workflowBookingId = 0;
  const sentEmails: Array<{ recipientEmail: string; subject: string; textBody: string }> = [];
  const originalFrontendUrl = process.env.FRONTEND_URL;
  const originalPaymentEnv = {
    WOMPI_ENVIRONMENT: process.env.WOMPI_ENVIRONMENT,
    WOMPI_PUBLIC_KEY: process.env.WOMPI_PUBLIC_KEY,
    WOMPI_PRIVATE_KEY: process.env.WOMPI_PRIVATE_KEY,
    WOMPI_INTEGRITY_SECRET: process.env.WOMPI_INTEGRITY_SECRET,
    WOMPI_EVENTS_SECRET: process.env.WOMPI_EVENTS_SECRET,
  };

  const suffix = `${Date.now()}-${process.pid}`;
  const customerEmail = `cliente-${suffix}@inktatto.test`;
  const secondEmail = `cliente-dos-${suffix}@inktatto.test`;
  const adminEmail = `admin-${suffix}@inktatto.test`;
  const password = 'TestPassword-2026!';

  async function verifyRegisteredAccount(email: string): Promise<string> {
    const verificationEmail = [...sentEmails].reverse().find((item) =>
      item.recipientEmail === email && item.subject.includes('Verifica tu correo'),
    );
    const token = verificationEmail?.textBody.match(/verify-email\?token=([a-f0-9]{64})/)?.[1];
    expect(token).toBeTruthy();
    await request(app!.getHttpServer())
      .post('/api/auth/email/verify')
      .send({ token })
      .expect(201);
    const login = await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    return login.body.token as string;
  }

  beforeAll(async () => {
    const database = process.env.DB_DATABASE ?? '';
    if (!/_test$/i.test(database)) {
      throw new Error(
        'Las pruebas MySQL reales solo pueden ejecutarse contra una base cuyo nombre termine en _test. No uses inktatto_db.',
      );
    }

    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.WOMPI_ENVIRONMENT = 'sandbox';
    process.env.WOMPI_PUBLIC_KEY = 'pub_test_database_e2e';
    process.env.WOMPI_PRIVATE_KEY = 'prv_test_database_e2e';
    process.env.WOMPI_INTEGRITY_SECRET = 'database-e2e-integrity-secret';
    process.env.WOMPI_EVENTS_SECRET = 'database-e2e-events-secret';
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
      .overrideProvider(EmailService)
      .useValue({
        isConfigured: jest.fn().mockReturnValue(true),
        send: jest.fn(async (message: { recipientEmail: string; subject: string; textBody: string }) => {
          sentEmails.push(message);
        }),
      })
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
    bookings = app.get<Repository<Booking>>(getRepositoryToken(Booking));
    contactMessages = app.get<Repository<ContactMessage>>(getRepositoryToken(ContactMessage));
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
    if (contactMessages) {
      await contactMessages.delete({ email: customerEmail });
    }
    if (app) await app.close();
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
    for (const [key, value] of Object.entries(originalPaymentEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('rechaza rutas protegidas sin token', async () => {
    await request(app!.getHttpServer()).get('/api/bookings/mine').expect(401);
    await request(app!.getHttpServer()).get('/api/users').expect(401);
    await request(app!.getHttpServer()).get('/api/contact').expect(401);
    await request(app!.getHttpServer()).get('/api/favorites').expect(401);
  });

  it('registra clientes sin permitir autoasignarse el rol admin', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({ email: `weak-${suffix}@inktatto.test`, password: '1234567', fullName: 'Contraseña débil' })
      .expect(400);

    const registration = await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({ email: customerEmail, password, fullName: 'Cliente de pruebas' })
      .expect(201);

    expect(registration.body.message).toMatch(/verificar la cuenta/);
    expect(registration.body).not.toHaveProperty('token');

    await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: `escalamiento-${suffix}@inktatto.test`,
        password,
        fullName: 'Intento de escalamiento',
        role: 'admin',
      })
      .expect(400);

    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password })
      .expect(401);
    customerToken = await verifyRegisteredAccount(customerEmail);

    const profile = await request(app!.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(profile.body.user.email).toBe(customerEmail);
    expect(profile.body.user).not.toHaveProperty('password');
  });

  it('guarda mensajes de contacto y limita su consulta a administradores', async () => {
    await request(app!.getHttpServer())
      .post('/api/contact')
      .send({ name: 'Cliente E2E', email: customerEmail, message: 'Quiero consultar una pieza personalizada.' })
      .expect(201);
    await request(app!.getHttpServer())
      .get('/api/contact')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    const result = await request(app!.getHttpServer())
      .get('/api/contact?page=1&pageSize=10&search=Cliente%20E2E')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(result.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: customerEmail, message: 'Quiero consultar una pieza personalizada.' }),
    ]));
    expect(result.body.meta.total).toBeGreaterThan(0);
  });

  it('persists favorites per account, prevents duplicates and allows removal', async () => {
    const token = customerToken || await verifyRegisteredAccount(customerEmail);
    const path = '/api/favorites';
    await request(app!.getHttpServer())
      .put(path)
      .set('Authorization', `Bearer ${token}`)
      .send({ designSlug: 'dragon' })
      .expect(200);
    await request(app!.getHttpServer())
      .put(path)
      .set('Authorization', `Bearer ${token}`)
      .send({ designSlug: 'dragon' })
      .expect(200);

    const listed = await request(app!.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body).toEqual(['dragon']);

    await request(app!.getHttpServer())
      .delete(`${path}/dragon`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    const afterRemoval = await request(app!.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(afterRemoval.body).toEqual([]);
  });

  it('bloquea reservas simultáneas del mismo artista y limita el acceso a imágenes', async () => {
    const second = await request(app!.getHttpServer())
      .post('/api/auth/register')
      .send({ email: secondEmail, password, fullName: 'Segundo cliente' })
      .expect(201);
    expect(second.body).not.toHaveProperty('token');
    secondCustomerToken = await verifyRegisteredAccount(secondEmail);

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
      .send({ reason: 'No corresponde al propietario de la reserva' })
      .expect(403);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${bookingOwnerToken}`)
      .send({ reason: 'El cliente necesita cambiar la fecha' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('cancelled');
        expect(body.cancellationReason).toBe('El cliente necesita cambiar la fecha');
        expect(body).not.toHaveProperty('adminNotes');
      });

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${bookingOwnerToken}`)
      .send({ reason: 'Intento repetido' })
      .expect(403);
  });

  it('permite al admin gestionar usuarios y reservas sin exponer contraseñas', async () => {
    await request(app!.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
    await request(app!.getHttpServer())
      .get('/api/notifications/status')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
    await request(app!.getHttpServer())
      .get('/api/notifications/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const userList = await request(app!.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(userList.body.data.some((user: { email: string }) => user.email === customerEmail)).toBe(true);
    expect(userList.body.data.every((user: { password?: string }) => !('password' in user))).toBe(true);

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
        const booking = body.data.find((item: { id: number }) => item.id === bookingId);
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
      .send({ status: 'quoted', quotedPrice: 250000, depositAmount: 50000, adminNotes: 'Diseño revisado' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('quoted');
        expect(body.quotedPrice).toBe('250000.00');
        expect(body.depositAmount).toBe('50000.00');
        expect(body.adminNotes).toBe('Diseño revisado');
      });

    const checkout = await request(app!.getHttpServer())
      .post(`/api/payments/bookings/${workflowBookingId}/checkout`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(201);
    expect(checkout.body.status).toBe('pending');
    expect(checkout.body.checkoutUrl).toContain('https://checkout.wompi.co/p/');
    const paymentStatus = await request(app!.getHttpServer())
      .get(`/api/payments/bookings/${workflowBookingId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(paymentStatus.body).toEqual({ status: 'pending' });
    await request(app!.getHttpServer())
      .get(`/api/payments/bookings/${workflowBookingId}`)
      .set('Authorization', `Bearer ${secondCustomerToken}`)
      .expect(403);

    await request(app!.getHttpServer())
      .patch(`/api/bookings/${workflowBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('confirmed'));

    const history = await request(app!.getHttpServer())
      .get(`/api/bookings/${workflowBookingId}/history`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(history.body.map((item: { toStatus: string }) => item.toStatus))
      .toEqual(['pending', 'quoted', 'confirmed']);
    expect(history.body[1].actorEmail).toBe(adminEmail);
  });

  it('envía recuperación con token de un solo uso y valida cambio de contraseña', async () => {
    const message = 'Si el correo corresponde a una cuenta activa, recibirás instrucciones para recuperar la contraseña.';
    await request(app!.getHttpServer())
      .post('/api/auth/password/change')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ currentPassword: 'wrong-password', newPassword: 'Changed-Test-Password-2026!' })
      .expect(401);
    await request(app!.getHttpServer())
      .post('/api/auth/password/change')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ currentPassword: password, newPassword: 'Changed-Test-Password-2026!' })
      .expect(201);
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password })
      .expect(401);

    await request(app!.getHttpServer())
      .post('/api/auth/password/forgot')
      .send({ email: customerEmail })
      .expect(201)
      .expect(({ body }) => expect(body.message).toBe(message));
    const email = sentEmails.find((item) => item.recipientEmail === customerEmail)!;
    const token = email.textBody.match(/reset-password\?token=([a-f0-9]{64})/)?.[1];
    expect(token).toBeTruthy();

    await request(app!.getHttpServer())
      .post('/api/auth/password/reset')
      .send({ token, password: 'Updated-Test-Password-2026!' })
      .expect(201);
    await request(app!.getHttpServer())
      .post('/api/auth/password/reset')
      .send({ token, password: 'Another-Test-Password-2026!' })
      .expect(400);

    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password: 'Changed-Test-Password-2026!' })
      .expect(401);
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password: 'Updated-Test-Password-2026!' })
      .expect(200);
  });

  it('invalida el token cuando la cuenta se desactiva', async () => {
    const customer = await users!.findOneByOrFail({ email: customerEmail });
    await request(app!.getHttpServer())
      .delete(`/api/users/${customer.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const retainedCustomer = await users!.findOneByOrFail({ email: customerEmail });
    expect(retainedCustomer.isActive).toBe(false);
    expect(await users!.countBy({ email: customerEmail })).toBe(1);

    await request(app!.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(401);

    const retainedBooking = await bookings!.findOne({
      where: { id: workflowBookingId },
      relations: { user: true },
    });
    expect(retainedBooking?.user.id).toBe(customer.id);
  });
});
