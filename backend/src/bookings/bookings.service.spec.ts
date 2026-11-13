import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };

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
    service = new BookingsService(repository as unknown as Repository<Booking>);
  });

  it('creates a pending booking associated with the authenticated user', async () => {
    const result = await service.create(customer, {
      artist: 'artist-one',
      date: '2027-01-15',
      time: '10:00',
      bodyArea: 'Brazo',
      size: 'Mediano',
      idea: 'Diseño de prueba suficientemente largo',
    });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ user: customer, status: 'pending' }));
    expect(result.status).toBe('pending');
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
});
