import { IsNotEmpty, IsString, MaxLength, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token!: string;

  @IsString()
  @IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: 'La contraseña debe tener al menos 12 caracteres e incluir mayúscula, minúscula, número y símbolo' })
  @MaxLength(72)
  password!: string;
}
