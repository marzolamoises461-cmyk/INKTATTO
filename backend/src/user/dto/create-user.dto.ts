import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser válido' }) @IsNotEmpty({ message: 'El email es obligatorio' }) email!: string;
  @IsString() @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' }) @MaxLength(72) @IsNotEmpty() password!: string;
  @IsString() @MaxLength(120) @IsNotEmpty({ message: 'El nombre completo es obligatorio' }) fullName!: string;
}
