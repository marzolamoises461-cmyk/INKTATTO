import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ maxLength: 100, example: 'Ana García' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  name!: string;

  @ApiProperty({ maxLength: 254, example: 'ana@example.com' })
  @IsEmail() @MaxLength(254)
  email!: string;

  @ApiProperty({ minLength: 10, maxLength: 1500 })
  @IsString() @IsNotEmpty() @MinLength(10) @MaxLength(1500)
  message!: string;
}
