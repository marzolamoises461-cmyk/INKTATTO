import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsIn(['user', 'admin']) @IsOptional() role?: 'user' | 'admin';
}
