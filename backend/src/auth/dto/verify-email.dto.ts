import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ maxLength: 128, writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token!: string;
}

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'cliente@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
