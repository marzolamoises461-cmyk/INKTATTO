import { Type } from 'class-transformer';
import {
  IsIn, IsInt, IsNumber, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateIf,
} from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsIn(['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'])
  status!: BookingStatus;

  @ValidateIf((dto: UpdateBookingStatusDto) => dto.status === 'quoted')
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(999999999999.99)
  quotedPrice?: number;

  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 0 }) @Min(0) @Max(999999999999)
  depositAmount?: number;

  @IsOptional() @IsString() @MaxLength(5000)
  adminNotes?: string;

  @ValidateIf((dto: UpdateBookingStatusDto) => ['cancelled', 'rejected'].includes(dto.status))
  @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(500)
  reason?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(30) @Max(480)
  durationMinutes?: number;
}
