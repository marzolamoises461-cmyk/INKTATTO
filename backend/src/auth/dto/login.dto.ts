import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty({ example: 'cliente@example.com' })
  @IsEmail({}, { message: 'El email debe ser válido' }) @IsNotEmpty() @MaxLength(254) email!: string;
  @ApiProperty({ writeOnly: true })
  @IsString() @IsNotEmpty() @MaxLength(72) password!: string;
}
