import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { ArtistBlock } from './entities/artist-block.entity';
import { Artist } from './entities/artist.entity';
import { ArtistSchedule } from './entities/artist-schedule.entity';

const BOGOTA_OFFSET_MINUTES = 5 * 60;

export function weekdayInBogota(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day);
  return new Date(utcMidnight + BOGOTA_OFFSET_MINUTES * 60_000).getUTCDay();
}

export function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isValidCalendarDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  if (year < 1000) return false;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function todayInBogota(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function minutesNowInBogota(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return value('hour') * 60 + value('minute');
}

function assertNoOverlappingWindows(
  windows: Array<Pick<ArtistSchedule, 'weekday' | 'opensAt' | 'closesAt'>>,
): void {
  for (let first = 0; first < windows.length; first += 1) {
    for (let second = first + 1; second < windows.length; second += 1) {
      const left = windows[first];
      const right = windows[second];
      if (
        left.weekday === right.weekday
        && minutesOfDay(left.opensAt) < minutesOfDay(right.closesAt)
        && minutesOfDay(right.opensAt) < minutesOfDay(left.closesAt)
      ) {
        throw new BadRequestException('Los horarios del mismo día no pueden superponerse');
      }
    }
  }
}

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private readonly artists: Repository<Artist>,
    @InjectRepository(ArtistSchedule) private readonly schedules: Repository<ArtistSchedule>,
    @InjectRepository(ArtistBlock) private readonly blocks: Repository<ArtistBlock>,
    private readonly dataSource: DataSource,
  ) {}

  list(): Promise<Artist[]> {
    return this.artists.find({ where: { isActive: true }, order: { displayName: 'ASC' } });
  }

  async availability(
    slug: string,
    date: string,
    durationMinutes = 60,
  ): Promise<{ date: string; slots: string[] }> {
    if (!isValidCalendarDate(date)) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }
    if (date < todayInBogota()) throw new BadRequestException('La fecha no puede estar en el pasado');
    if (!Number.isInteger(durationMinutes) || durationMinutes < 30 || durationMinutes > 480) {
      throw new BadRequestException('La duración debe estar entre 30 y 480 minutos');
    }
    const artist = await this.artists.findOneBy({ slug, isActive: true });
    if (!artist) throw new NotFoundException('Artista no encontrado');

    const weekday = weekdayInBogota(date);
    const earliestMinute = date === todayInBogota() ? minutesNowInBogota() : 0;
    const [windows, blocks, bookings] = await Promise.all([
      this.schedules.find({ where: { artistId: artist.id, weekday }, order: { opensAt: 'ASC' } }),
      this.blocks.find({ where: { artistId: artist.id, blockedDate: date } }),
      this.dataSource.getRepository(Booking).find({
        where: { artistId: artist.id, date, status: In(['pending', 'quoted', 'confirmed']) },
        select: { time: true, durationMinutes: true },
      }),
    ]);
    assertNoOverlappingWindows(windows);

    const slots = new Set<string>();
    for (const window of windows) {
      const start = minutesOfDay(window.opensAt);
      const end = minutesOfDay(window.closesAt);
      for (let minute = start; minute + durationMinutes <= end; minute += 30) {
        if (minute < earliestMinute) continue;
        const overlapsBlock = blocks.some((block) => {
          if (!block.startsAt || !block.endsAt) return true;
          return minute < minutesOfDay(block.endsAt) && minutesOfDay(block.startsAt) < minute + durationMinutes;
        });
        const overlapsBooking = bookings.some((booking) => {
          const bookedStart = minutesOfDay(booking.time);
          return minute < bookedStart + booking.durationMinutes && bookedStart < minute + durationMinutes;
        });
        if (!overlapsBlock && !overlapsBooking) {
          slots.add(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`);
        }
      }
    }
    return { date, slots: [...slots].sort() };
  }

  async replaceSchedule(
    artistId: number,
    windows: Array<{ weekday: number; opensAt: string; closesAt: string }>,
  ): Promise<ArtistSchedule[]> {
    const artist = await this.artists.findOneBy({ id: artistId });
    if (!artist) throw new NotFoundException('Artista no encontrado');
    for (const window of windows) {
      if (minutesOfDay(window.opensAt) >= minutesOfDay(window.closesAt)) {
        throw new BadRequestException('La hora de cierre debe ser posterior a la apertura');
      }
    }
    const keys = windows.map(({ weekday, opensAt, closesAt }) => `${weekday}:${opensAt}:${closesAt}`);
    if (new Set(keys).size !== keys.length) throw new BadRequestException('No se permiten horarios duplicados');
    assertNoOverlappingWindows(windows);

    return this.dataSource.transaction(async (manager) => {
      await manager.delete(ArtistSchedule, { artistId });
      return manager.save(ArtistSchedule, windows.map((window) => ({ ...window, artistId })));
    });
  }

  async createBlock(artistId: number, dto: {
    date: string; startsAt?: string; endsAt?: string; reason?: string;
  }): Promise<ArtistBlock> {
    if (!isValidCalendarDate(dto.date)) throw new BadRequestException('Fecha no válida');
    if ((dto.startsAt && !dto.endsAt) || (!dto.startsAt && dto.endsAt)) {
      throw new BadRequestException('Indica las dos horas para bloquear solo una parte del día');
    }
    if (dto.startsAt && dto.endsAt && minutesOfDay(dto.startsAt) >= minutesOfDay(dto.endsAt)) {
      throw new BadRequestException('La hora final debe ser posterior a la inicial');
    }
    const artist = await this.artists.findOneBy({ id: artistId });
    if (!artist) throw new NotFoundException('Artista no encontrado');
    return this.blocks.save(this.blocks.create({
      artistId, blockedDate: dto.date, startsAt: dto.startsAt ?? null,
      endsAt: dto.endsAt ?? null, reason: dto.reason ?? null,
    }));
  }

  async removeBlock(artistId: number, blockId: number): Promise<void> {
    const result = await this.blocks.delete({ id: blockId, artistId });
    if (!result.affected) throw new NotFoundException('Bloqueo no encontrado');
  }

  async assertCanBook(
    manager: EntityManager,
    artistSlug: string,
    date: string,
    time: string,
    durationMinutes: number,
  ): Promise<Artist> {
    if (!isValidCalendarDate(date)) throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    if (date < todayInBogota()) throw new BadRequestException('La fecha no puede estar en el pasado');
    if (date === todayInBogota() && minutesOfDay(time) < minutesNowInBogota()) {
      throw new ConflictException('La hora seleccionada ya pasó en la zona horaria del estudio');
    }
    const artist = await manager.findOne(Artist, {
      where: { slug: artistSlug, isActive: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!artist) throw new NotFoundException('Artista no disponible');

    const start = minutesOfDay(time);
    const end = start + durationMinutes;
    const windows = await manager.find(ArtistSchedule, {
      where: { artistId: artist.id, weekday: weekdayInBogota(date) },
    });
    if (!windows.some((window) => start >= minutesOfDay(window.opensAt) && end <= minutesOfDay(window.closesAt))) {
      throw new ConflictException('El horario está fuera de la jornada disponible del artista');
    }

    const blocks = await manager.find(ArtistBlock, { where: { artistId: artist.id, blockedDate: date } });
    if (blocks.some((block) => !block.startsAt || (
      start < minutesOfDay(block.endsAt!) && minutesOfDay(block.startsAt) < end
    ))) {
      throw new ConflictException('El artista no está disponible en ese horario');
    }

    const bookings = await manager.find(Booking, {
      where: { artistId: artist.id, date, status: In(['pending', 'quoted', 'confirmed']) },
      select: { time: true, durationMinutes: true },
    });
    if (bookings.some((booking) => {
      const bookedStart = minutesOfDay(booking.time);
      return start < bookedStart + booking.durationMinutes && bookedStart < end;
    })) {
      throw new ConflictException('Ese horario acaba de ser reservado. Elige otro horario');
    }
    return artist;
  }
}
