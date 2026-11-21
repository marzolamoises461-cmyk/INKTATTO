import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { ArtistsService } from '../artists/artists.service';
import { User } from '../user/entities/user.entity';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingReferenceImage } from './entities/booking-reference-image.entity';
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import { ReferenceImageStorageService } from './reference-image-storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let manager: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let artists: { assertCanBook: jest.Mock };
  let storage: { upload: jest.Mock; remove: jest.Mock };
  let images: { find: jest.Mock; findOne: jest.Mock };
  let statusHistory: { find: jest.Mock };
  let notifications: { queueBookingEvent: jest.Mock };
  let bookingQuery: {
    leftJoinAndSelect: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const customer = { id: 5, email: 'cliente@ejemplo.com', fullName: 'Cliente' } as User;
  const admin = { id: 7, email: 'admin@ejemplo.com', fullName: 'Admin', role: 'admin' } as User;
  const makePending = () => ({
    id: 10,
    user: customer,
    status: 'pending',
    artist: 'artist-one',
    date: '2027-01-15',
    time: '10:00:00',
    bodyArea: 'Brazo',
    size: 'Mediano',
    idea: 'Diseño de prueba suficientemente largo',
    quotedPrice: null,
    depositAmount: null,
    adminNotes: null,
    cancellationReason: null,
    rejectionReason: null,
    cancelledAt: null,
  } as Booking);

  beforeEach(() => {
    repository = {
      create: jest.fn((value: Partial<Booking>) => value),
      save: jest.fn(async (value: Booking) => value),
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
    };
    bookingQuery = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    repository.createQueryBuilder.mockReturnValue(bookingQuery);
    manager = {
      create: jest.fn((_entity: unknown, value: Partial<Booking>) => value),
      save: jest.fn(async (_entity: unknown, value: Booking) => value),
      findOne: jest.fn().mockResolvedValue(makePending()),
    };
    dataSource = {
      transaction: jest.fn((callback: (transactionManager: typeof manager) => unknown) => callback(manager)),
    };
    artists = {
      assertCanBook: jest.fn().mockResolvedValue({ id: 2, slug: 'artist-one' }),
    };
    storage = {
      upload: jest.fn().mockResolvedValue({
        objectKey: 'booking-references/image.jpg',
        storageUrl: 'https://storage.example/bucket/image.jpg',
        originalName: 'image.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 3,
      }),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    images = { find: jest.fn().mockResolvedValue([]), findOne: jest.fn() };
    statusHistory = { find: jest.fn().mockResolvedValue([]) };
    notifications = { queueBookingEvent: jest.fn().mockResolvedValue(undefined) };
    service = new BookingsService(
      repository as unknown as Repository<Booking>,
      images as unknown as Repository<BookingReferenceImage>,
      statusHistory as unknown as Repository<BookingStatusHistory>,
      dataSource as unknown as DataSource,
      artists as unknown as ArtistsService,
      storage as unknown as ReferenceImageStorageService,
      notifications as unknown as NotificationsService,
    );
  });

  it('creates a pending booking associated with the authenticated user', async () => {
    const result = await service.create(customer, {
      artist: 'artist-one',
      date: '2027-01-15',
      time: '10:00',
      bodyArea: 'Brazo',
      size: 'Mediano',
      idea: 'Diseño de prueba suficientemente largo',
    }, [{
      originalname: 'image.jpg',
      buffer: Buffer.from([0xff, 0xd8, 0xff]),
      size: 3,
    } as Express.Multer.File]);
    expect(artists.assertCanBook).toHaveBeenCalledWith(
      manager, 'artist-one', '2027-01-15', '10:00', 60,
    );
    expect(manager.create).toHaveBeenCalledWith(Booking, expect.objectContaining({
      user: customer, status: 'pending', artistId: 2,
    }));
    expect(result.status).toBe('pending');
    expect(() => instanceToPlain(result)).not.toThrow();
    expect(dataSource.transaction).toHaveBeenCalled();
  });

  it('allows the owner to cancel a pending booking', async () => {
    const result = await service.cancelMine(10, customer, 'No puedo asistir');
    expect(result.status).toBe('cancelled');
    expect(result.cancellationReason).toBe('No puedo asistir');
    expect(manager.save).toHaveBeenCalledWith(BookingStatusHistory, expect.objectContaining({
      fromStatus: 'pending',
      toStatus: 'cancelled',
      actorId: customer.id,
    }));
    expect(notifications.queueBookingEvent).toHaveBeenCalledWith(
      manager, expect.any(Object), 'booking.cancelled', 'No puedo asistir',
    );
  });

  it('prevents another user from cancelling the booking', async () => {
    await expect(service.cancelMine(10, { id: 999 } as User, 'No puedo asistir'))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 404 when a booking does not exist', async () => {
    manager.findOne.mockResolvedValue(null);
    await expect(service.cancelMine(404, customer, 'No puedo asistir')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects invalid booking status transitions', async () => {
    await expect(service.updateStatus(10, { status: 'completed' }, admin))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores quote details and the responsible admin in status history', async () => {
    const result = await service.updateStatus(10, {
      status: 'quoted',
      quotedPrice: 250000,
      depositAmount: 50000,
      adminNotes: 'Trazar en consulta',
      durationMinutes: 120,
    }, admin);

    expect(result.status).toBe('quoted');
    expect(result.quotedPrice).toBe('250000.00');
    expect(result.depositAmount).toBe('50000.00');
    expect(result.adminNotes).toBe('Trazar en consulta');
    expect(result.durationMinutes).toBe(120);
    expect(artists.assertCanBook).toHaveBeenCalledWith(
      manager, 'artist-one', '2027-01-15', '10:00:00', 120, 10,
    );
    expect(manager.save).toHaveBeenCalledWith(BookingStatusHistory, expect.objectContaining({
      fromStatus: 'pending',
      toStatus: 'quoted',
      actorId: admin.id,
      actorEmail: admin.email,
    }));
    expect(notifications.queueBookingEvent).toHaveBeenCalledWith(
      manager, expect.any(Object), 'booking.quoted', undefined,
    );
  });

  it('rejects a quoted duration that would collide with another booking', async () => {
    artists.assertCanBook.mockRejectedValue(new ConflictException('El nuevo tiempo estimado se superpone con otra cita'));

    await expect(service.updateStatus(10, {
      status: 'quoted',
      quotedPrice: 250000,
      durationMinutes: 180,
    }, admin)).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('does not expose private admin notes in client booking views', async () => {
    const result = await service.findMine(customer.id);
    expect(result).toHaveLength(0);
    repository.find.mockResolvedValue([{
      ...makePending(),
      adminNotes: 'Nota interna',
      user: customer,
    }]);
    const bookings = await service.findMine(customer.id);
    expect(bookings[0]).not.toHaveProperty('adminNotes');
    expect(bookings[0].status).toBe('pending');
  });

  it('filters, orders and paginates administrator booking listings', async () => {
    const query = Object.assign(new AdminListQueryDto(), {
      page: 2,
      pageSize: 10,
      search: 'ana',
      status: 'quoted',
      sortBy: 'date',
      sortOrder: 'ASC' as const,
    });

    const result = await service.findAll(query);

    expect(bookingQuery.leftJoinAndSelect).toHaveBeenCalledWith('booking.user', 'user');
    expect(bookingQuery.andWhere).toHaveBeenCalledWith(expect.stringContaining('user.email LIKE :search'), {
      search: '%ana%',
    });
    expect(bookingQuery.andWhere).toHaveBeenCalledWith('booking.status = :status', { status: 'quoted' });
    expect(bookingQuery.orderBy).toHaveBeenCalledWith('booking.date', 'ASC');
    expect(bookingQuery.skip).toHaveBeenCalledWith(10);
    expect(bookingQuery.take).toHaveBeenCalledWith(10);
    expect(result.meta).toEqual({ page: 2, pageSize: 10, total: 0, totalPages: 0 });
  });

  it('rejects unapproved booking sort columns', async () => {
    await expect(service.findAll(Object.assign(new AdminListQueryDto(), { sortBy: 'user.password' })))
      .rejects.toBeInstanceOf(BadRequestException);
  });
});
