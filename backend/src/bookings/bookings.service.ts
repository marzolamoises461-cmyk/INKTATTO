import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(@InjectRepository(Booking) private readonly bookings: Repository<Booking>) {}

  async create(user: User, dto: CreateBookingDto): Promise<Booking> {
    const today = new Date().toISOString().slice(0, 10);
    if (dto.date < today) throw new BadRequestException('La fecha de la solicitud no puede estar en el pasado');

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
