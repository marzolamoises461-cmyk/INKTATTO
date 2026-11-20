import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';

const STUDIO_TIME_ZONE = 'America/Bogota';

function getStudioDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STUDIO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

@Injectable()
export class BookingsService {
  constructor(@InjectRepository(Booking) private readonly bookings: Repository<Booking>) {}

  async create(user: User, dto: CreateBookingDto): Promise<Booking> {
    const todayInBogota = getStudioDate();
    if (dto.date < todayInBogota) {
      throw new BadRequestException('La fecha de la solicitud no puede estar en el pasado (hora de Colombia)');
    }

    const booking = this.bookings.create({ ...dto, user, status: 'pending' });
    return this.bookings.save(booking);
  }

  async findMine(userId: number): Promise<Booking[]> {
    return this.bookings.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookings.find({ relations: { user: true }, order: { createdAt: 'DESC' } });
  }

  async cancelMine(id: number, userId: number): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    if (booking.user.id !== userId) throw new ForbiddenException('No puedes cancelar una solicitud de otra persona');
    if (booking.status !== 'pending') throw new ForbiddenException('Solo se pueden cancelar solicitudes pendientes');
    booking.status = 'cancelled';
    return this.bookings.save(booking);
  }

  async updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La solicitud no existe');
    booking.status = dto.status;
    return this.bookings.save(booking);
  }
}
