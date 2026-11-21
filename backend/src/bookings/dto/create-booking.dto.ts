import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, MaxLength, MinLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ maxLength: 80 })
  @IsString() @IsNotEmpty() @MaxLength(80)
  artist!: string;

  @ApiProperty({ example: '2027-01-15', format: 'date' })
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @ApiProperty({ example: '10:00', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora debe tener formato HH:mm' })
  time!: string;

  @ApiPropertyOptional({ minimum: 30, maximum: 480, default: 60 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(30) @Max(480)
  durationMinutes?: number;

  @ApiProperty({ maxLength: 80 })
  @IsString() @IsNotEmpty() @MaxLength(80)
  bodyArea!: string;

  @ApiProperty({ maxLength: 80 })
  @IsString() @IsNotEmpty() @MaxLength(80)
  size!: string;

  @ApiProperty({ minLength: 10, maxLength: 1200 })
  @IsString() @MinLength(10) @MaxLength(1200)
  idea!: string;
}
