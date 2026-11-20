import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock };
  let staffRepo: { findOne: jest.Mock };
  const customer = { id: 5, email: 'cliente@ejemplo.com', fullName: 'Cliente' } as User;
  const staff = { id: 2, name: 'Faver', isActive: true, workingDays: [1,2,3,4,5,6], workdayStart: '10:00:00', workdayEnd: '18:00:00', slotDurationMinutes: 60 } as StaffMember;
  const pending = { id: 10, user: customer, status: 'pending', artist: 'Faver', date: '2027-01-15', time: '10:00:00' } as Booking;
  beforeEach(() => {
    jest.useRealTimers();
    bookingRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(pending),
      save: jest.fn(async (value: Booking) => value),
      createQueryBuilder: jest.fn(() => ({ where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) })),
    };
    staffRepo = { findOne: jest.fn().mockResolvedValue(staff) };
    const manager = { getRepository: (entity: unknown) => entity === StaffMember ? staffRepo : bookingRepo };
    const dataSource = { transaction: (callback: (manager: typeof manager) => unknown) => callback(manager), getRepository: () => staffRepo } as unknown as DataSource;
    service = new BookingsService(bookingRepo as unknown as Repository<Booking>, dataSource);
  });
  afterEach(() => jest.useRealTimers());

  it('creates a pending booking linked to the selected staff member', async () => {
    const result = await service.create(customer, { artistId: 2, date: '2027-01-15', time: '10:00', bodyArea: 'Brazo', size: 'Mediano', idea: 'Diseño de prueba suficientemente largo' });
    expect(result.status).toBe('pending');
    expect(result.artist).toBe('Faver');
  });
  it('uses the studio calendar in America/Bogota', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-20T01:30:00.000Z'));
    await expect(service.create(customer, { artistId: 2, date: '2026-11-19', time: '10:00', bodyArea: 'Brazo', size: 'Mediano', idea: 'Diseño de prueba suficientemente largo' })).resolves.toBeDefined();
  });
  it('rejects dates in the past using the studio calendar', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-20T01:30:00.000Z'));
    await expect(service.create(customer, { artistId: 2, date: '2026-11-18', time: '10:00', bodyArea: 'Brazo', size: 'Mediano', idea: 'Diseño de prueba suficientemente largo' })).rejects.toBeInstanceOf(BadRequestException);
  });
  it('allows the owner to cancel a pending booking', async () => {
    const result = await service.cancelMine(10, customer.id);
    expect(result.status).toBe('cancelled');
  });
  it('prevents another user from cancelling the booking', async () => {
    await expect(service.cancelMine(10, 999)).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('returns 404 when a booking does not exist', async () => {
    bookingRepo.findOne.mockResolvedValue(null);
    await expect(service.cancelMine(404, customer.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
