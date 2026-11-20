import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { ArtistBlock } from './entities/artist-block.entity';
import { Artist } from './entities/artist.entity';
import { ArtistSchedule } from './entities/artist-schedule.entity';
import { ArtistsService, weekdayInBogota } from './artists.service';

describe('ArtistsService', () => {
  const artist = { id: 4, slug: 'faver', isActive: true } as Artist;
  const manager = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  let service: ArtistsService;
  let schedules: { find: jest.Mock };
  let blocks: { find: jest.Mock };
  let artists: { findOneBy: jest.Mock };
  let dataSource: { getRepository: jest.Mock; transaction: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    artists = { findOneBy: jest.fn().mockResolvedValue(artist) };
    schedules = { find: jest.fn().mockResolvedValue([]) };
    blocks = { find: jest.fn().mockResolvedValue([]) };
    dataSource = { getRepository: jest.fn(), transaction: jest.fn() };
    manager.findOne.mockResolvedValue(artist);
    manager.find.mockResolvedValue([]);
    service = new ArtistsService(
      artists as unknown as Repository<Artist>,
      schedules as unknown as Repository<ArtistSchedule>,
      blocks as unknown as Repository<ArtistBlock>,
      dataSource as unknown as DataSource,
    );
  });

  it('calculates weekday from the Bogota calendar date', () => {
    expect(weekdayInBogota('2027-01-15')).toBe(5);
  });

  it('rejects impossible dates rather than normalizing them', async () => {
    await expect(service.availability('faver', '2027-02-30')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('loads the selected artist schedule and blocks for administration', async () => {
    const schedule = [{ artistId: artist.id, weekday: 1, opensAt: '09:00', closesAt: '17:00' }];
    const block = [{ artistId: artist.id, blockedDate: '2027-01-18', startsAt: null, endsAt: null }];
    schedules.find.mockResolvedValue(schedule);
    blocks.find.mockResolvedValue(block);

    await expect(service.schedule(artist.id)).resolves.toBe(schedule);
    await expect(service.listBlocks(artist.id)).resolves.toBe(block);
    expect(schedules.find).toHaveBeenCalledWith({
      where: { artistId: artist.id },
      order: { weekday: 'ASC', opensAt: 'ASC' },
    });
  });

  it('rejects overlapping schedule windows before replacing the artist schedule', async () => {
    await expect(service.replaceSchedule(artist.id, [
      { weekday: 5, opensAt: '09:00', closesAt: '12:00' },
      { weekday: 5, opensAt: '11:00', closesAt: '14:00' },
    ])).rejects.toBeInstanceOf(BadRequestException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('takes an artist row lock and rejects overlapping booking windows', async () => {
    manager.find.mockImplementation(async (entity: unknown) => {
      if (entity === ArtistSchedule) return [{ artistId: artist.id, weekday: 5, opensAt: '09:00', closesAt: '18:00' }];
      if (entity === ArtistBlock) return [];
      if (entity === Booking) return [{ time: '10:30:00', durationMinutes: 60 }];
      return [];
    });

    await expect(service.assertCanBook(
      manager as unknown as EntityManager, 'faver', '2027-01-15', '10:00', 60,
    )).rejects.toBeInstanceOf(ConflictException);
    expect(manager.findOne).toHaveBeenCalledWith(Artist, expect.objectContaining({
      lock: { mode: 'pessimistic_write' },
    }));
  });
});
