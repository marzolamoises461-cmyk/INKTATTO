import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString() @IsOptional() @MinLength(2) @MaxLength(120)
  fullName?: string

  @IsEmail() @IsOptional() @MaxLength(190)
  email?: string
}
