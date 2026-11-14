import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class StaffMemberDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @IsString() @MinLength(2) @MaxLength(100) specialty!: string;
  @IsOptional() @IsString() @MaxLength(1200) bio?: string;
  @IsOptional() @IsString() @MaxLength(1500) imageUrl?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}