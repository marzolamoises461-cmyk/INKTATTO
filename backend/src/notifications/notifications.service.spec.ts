import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { EmailService } from './email.service';
import { NotificationOutbox } from './entities/notification-outbox.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let outbox: {
    insert: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
    find: jest.Mock;
  };
  let bookings: {
    createQueryBuilder: jest.Mock;
    update: jest.Mock;
  };
  let email: { isConfigured: jest.Mock; send: jest.Mock };
  let query: {
    innerJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    take: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(() => {
    outbox = {
      insert: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      find: jest.fn().mockResolvedValue([]),
    };
    query = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    bookings = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    email = {
      isConfigured: jest.fn().mockReturnValue(false),
      send: jest.fn().mockResolvedValue(undefined),
    };
    service = new NotificationsService(
      outbox as unknown as Repository<NotificationOutbox>,
      bookings as unknown as Repository<Booking>,
      { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService,
      email as unknown as EmailService,
    );
  });

  it('queues a deduplicated reminder once an appointment is within 24 hours', async () => {
    query.getMany.mockResolvedValue([{
      id: 21,
      date: '2027-01-11',
      time: '09:00:00',
      artist: 'faver',
      user: { email: 'client@example.com', fullName: 'Cliente' },
    }]);

    const queued = await service.queueDueReminders(new Date('2027-01-10T15:00:00.000Z'));

    expect(queued).toBe(1);
    expect(query.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('NOT EXISTS'),
      { eventType: 'booking.reminder-24h' },
    );
    expect(outbox.insert).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'booking.reminder-24h',
      entityId: 21,
      dedupeKey: '21:booking.reminder-24h:client',
      recipientEmail: 'client@example.com',
    }));
  });

  it('does not send queued notices as delivered when SMTP is unavailable', async () => {
    const queueReminders = jest.spyOn(service, 'queueDueReminders').mockResolvedValue(0);

    await service.dispatchScheduled();

    expect(queueReminders).toHaveBeenCalled();
    expect(outbox.find).not.toHaveBeenCalled();
    expect(outbox.update).not.toHaveBeenCalled();
    expect(email.send).not.toHaveBeenCalled();
  });
});
