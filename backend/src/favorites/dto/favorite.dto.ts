import { IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteDto {
  @ApiProperty({ maxLength: 120, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
  @IsString() @MaxLength(120) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  designSlug!: string;
}
