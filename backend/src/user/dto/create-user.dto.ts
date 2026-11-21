import { IsEmail, IsNotEmpty, IsString, MaxLength, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({ example: 'cliente@example.com' })
  @IsEmail({}, { message: 'El email debe ser válido' }) @IsNotEmpty({ message: 'El email es obligatorio' }) email!: string;
  @ApiProperty({ minLength: 12, maxLength: 72, writeOnly: true })
  @IsString() @IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: 'La contraseña debe tener al menos 12 caracteres e incluir mayúscula, minúscula, número y símbolo' }) @MaxLength(72) @IsNotEmpty() password!: string;
  @ApiProperty({ maxLength: 120, example: 'Ana García' })
  @IsString() @MaxLength(120) @IsNotEmpty({ message: 'El nombre completo es obligatorio' }) fullName!: string;
}
