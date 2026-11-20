import { IsIn } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsIn(['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'])
  status!: BookingStatus;
}
