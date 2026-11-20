import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { ArtistsService } from '../artists/artists.service';
import { User } from '../user/entities/user.entity';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingReferenceImage } from './entities/booking-reference-image.entity';
import { ReferenceImageStorageService } from './reference-image-storage.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let manager: { create: jest.Mock; save: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let artists: { assertCanBook: jest.Mock };
  let storage: { upload: jest.Mock; remove: jest.Mock };
  let images: { find: jest.Mock; findOne: jest.Mock };

  const customer = { id: 5, email: 'cliente@ejemplo.com', fullName: 'Cliente' } as User;
  const pending = {
    id: 10,
    user: customer,
    status: 'pending',
    artist: 'artist-one',
    date: '2027-01-15',
    time: '10:00:00',
    bodyArea: 'Brazo',
    size: 'Mediano',
    idea: 'Diseño de prueba suficientemente largo',
  } as Booking;

  beforeEach(() => {
    repository = {
      create: jest.fn((value: Partial<Booking>) => value),
      save: jest.fn(async (value: Booking) => value),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(pending),
    };
    manager = {
      create: jest.fn((_entity: unknown, value: Partial<Booking>) => value),
      save: jest.fn(async (_entity: unknown, value: Booking) => value),
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
    service = new BookingsService(
      repository as unknown as Repository<Booking>,
      images as unknown as Repository<BookingReferenceImage>,
      dataSource as unknown as DataSource,
      artists as unknown as ArtistsService,
      storage as unknown as ReferenceImageStorageService,
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
    const result = await service.cancelMine(10, customer.id);
    expect(result.status).toBe('cancelled');
    expect(repository.save).toHaveBeenCalledWith(pending);
  });

  it('prevents another user from cancelling the booking', async () => {
    await expect(service.cancelMine(10, 999)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 404 when a booking does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.cancelMine(404, customer.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects invalid booking status transitions', async () => {
    pending.status = 'pending';
    await expect(service.updateStatus(10, { status: 'completed' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
