import { IsDateString, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class CreateArtistBlockDto {
  @IsDateString()
  date!: string;

  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startsAt?: string;

  @ValidateIf((value: CreateArtistBlockDto) => value.startsAt !== undefined)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endsAt?: string;

  @IsOptional() @IsString() @MaxLength(255)
  reason?: string;
}
