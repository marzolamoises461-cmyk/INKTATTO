import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, MaxLength, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  artist!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora debe tener formato HH:mm' })
  time!: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(30) @Max(480)
  durationMinutes?: number;

  @IsString() @IsNotEmpty() @MaxLength(80)
  bodyArea!: string;

  @IsString() @IsNotEmpty() @MaxLength(80)
  size!: string;

  @IsString() @MinLength(10) @MaxLength(1200)
  idea!: string;
}
