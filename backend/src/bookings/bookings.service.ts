import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking, BookingStatus } from './entities/booking.entity';

const STUDIO_TIME_ZONE = 'America/Bogota';
const ACTIVE_STATUSES: BookingStatus[] = ['confirmed'];

function getStudioDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: STUDIO_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function minutes(value: string): number {
  const [hours, mins] = value.slice(0, 5).split(':').map(Number);
  return hours * 60 + mins;
}
function asTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async availability(artistId: number, date: string): Promise<{ artistId: number; date: string; slots: string[] }> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < getStudioDate()) throw new BadRequestException('Selecciona una fecha válida de hoy en adelante.');
    const staff = await this.dataSource.getRepository(StaffMember).findOneBy({ id: artistId, isActive: true });
    if (!staff) throw new NotFoundException('El artista no existe o está inactivo.');
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const days = staff.workingDays ?? [1, 2, 3, 4, 5, 6];
    if (!days.includes(weekday)) return { artistId, date, slots: [] };
    const duration = staff.slotDurationMinutes || 60;
    const start = minutes(staff.workdayStart);
    const end = minutes(staff.workdayEnd);
    const confirmed = await this.bookings.find({ where: { artistMember: { id: artistId }, date, status: 'confirmed' } });
    const occupied = new Set(confirmed.map((booking) => minutes(booking.time)));
    const slots: string[] = [];
    for (let slot = start; slot + duration <= end; slot += duration) {
      if (!occupied.has(slot)) slots.push(asTime(slot));
    }
    return { artistId, date, slots };
  }

  async create(user: User, dto: CreateBookingDto): Promise<Booking> {
    if (dto.date < getStudioDate()) throw new BadRequestException('La fecha de la solicitud no puede estar en el pasado (hora de Colombia)');
    return this.dataSource.transaction(async (manager) => {
      const staff = await manager.getRepository(StaffMember).findOne({
        where: { id: dto.artistId, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!staff) throw new NotFoundException('El artista no existe o está inactivo.');
      const weekday = new Date(`${dto.date}T12:00:00Z`).getUTCDay();
      const days = staff.workingDays ?? [1, 2, 3, 4, 5, 6];
      const start = minutes(staff.workdayStart);
      const end = minutes(staff.workdayEnd);
      const chosen = minutes(dto.time);
      const duration = staff.slotDurationMinutes || 60;
      if (!days.includes(weekday) || chosen < start || chosen + duration > end || (chosen - start) % duration !== 0) {
        throw new BadRequestException('El horario no corresponde a la agenda configurada para este artista.');
      }
      const conflict = await manager.getRepository(Booking).createQueryBuilder('booking')
        .where('booking.artist_id = :artistId', { artistId: staff.id })
        .andWhere('booking.booking_date = :date', { date: dto.date })
        .andWhere('booking.status = :status', { status: 'confirmed' })
        .andWhere('booking.preferred_time < :newEnd', { newEnd: asTime(chosen + duration) })
        .andWhere('ADDTIME(booking.preferred_time, SEC_TO_TIME(:existingDuration * 60)) > :newStart', { existingDuration: duration, newStart: dto.time })
        .getOne();
      if (conflict) throw new BadRequestException('Ese horario acaba de ser ocupado. Selecciona otro.');
      const booking = manager.getRepository(Booking).create({
        user, artistMember: staff, artist: staff.name, date: dto.date, time: dto.time,
        bodyArea: dto.bodyArea, size: dto.size, idea: dto.idea, status: 'pending',
        referenceImages: [], quotedPrice: null, studioNotes: null,
      });
      return manager.getRepository(Booking).save(booking);
    });
  }

  async findMine(userId: number): Promise<Booking[]> {
    return this.bookings.find({ where: { user: { id: userId } }, relations: { artistMember: true }, order: { createdAt: 'DESC' } });
  }
  async findAll(): Promise<Booking[]> {
    return this.bookings.find({ relations: { user: true, artistMember: true }, order: { createdAt: 'DESC' } });
  }
  async cancelMine(id: number, userId: number): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    if (booking.user.id !== userId) throw new ForbiddenException('No puedes cancelar una solicitud de otra persona');
    if (booking.status !== 'pending' && booking.status !== 'quoted') throw new ForbiddenException('Solo puedes cancelar solicitudes pendientes o cotizadas.');
    booking.status = 'cancelled';
    return this.bookings.save(booking);
  }
  async updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true, artistMember: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    const allowed: Record<BookingStatus, BookingStatus[]> = {
      pending: ['quoted', 'cancelled'],
      quoted: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    if (dto.status !== booking.status && !allowed[booking.status].includes(dto.status)) {
      throw new BadRequestException(`Transición no permitida: ${booking.status} → ${dto.status}.`);
    }
    if (dto.status === 'quoted' && dto.quotedPrice === undefined && booking.quotedPrice === null) {
      throw new BadRequestException('Debes indicar el precio al enviar una cotización.');
    }
    booking.status = dto.status;
    if (dto.quotedPrice !== undefined) booking.quotedPrice = String(dto.quotedPrice);
    if (dto.studioNotes !== undefined) booking.studioNotes = dto.studioNotes;
    return this.bookings.save(booking);
  }
}
