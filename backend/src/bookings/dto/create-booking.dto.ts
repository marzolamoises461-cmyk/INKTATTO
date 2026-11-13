import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  artist!: string;

  @IsDateString()
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora debe tener formato HH:mm' })
  time!: string;

  @IsString() @IsNotEmpty() @MaxLength(80)
  bodyArea!: string;

  @IsString() @IsNotEmpty() @MaxLength(80)
  size!: string;

  @IsString() @MinLength(10) @MaxLength(1200)
  idea!: string;
}
