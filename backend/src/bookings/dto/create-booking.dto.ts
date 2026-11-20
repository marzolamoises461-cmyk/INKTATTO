import { IsDateString, IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsInt() @Min(1)
  artistId!: number;
  @IsDateString() date!: string;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora debe tener formato HH:mm' })
  time!: string;
  @IsString() @IsNotEmpty() @MaxLength(80) bodyArea!: string;
  @IsString() @IsNotEmpty() @MaxLength(80) size!: string;
  @IsString() @MinLength(10) @MaxLength(1200) idea!: string;
}
