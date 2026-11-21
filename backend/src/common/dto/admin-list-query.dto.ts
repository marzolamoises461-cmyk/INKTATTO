import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminListQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize = 20;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional() @IsString() @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo permitido según el listado: users (createdAt,email,fullName,role,isActive), bookings (createdAt,date,status,artist), contact (createdAt,fullName,email).',
  })
  @IsOptional() @IsString() @MaxLength(40)
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional() @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ enum: ['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'] })
  @IsOptional() @IsIn(['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'])
  status?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  query: AdminListQueryDto,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}
