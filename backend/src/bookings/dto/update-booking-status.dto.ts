import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsIn(['pending', 'quoted', 'confirmed', 'completed', 'cancelled'])
  status!: BookingStatus;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  quotedPrice?: number;
  @IsOptional() @IsString() @MaxLength(4000)
  studioNotes?: string;
}
