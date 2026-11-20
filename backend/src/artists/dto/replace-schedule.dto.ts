import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Matches, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleWindowDto {
  @IsInt() @Min(0) @Max(6)
  weekday!: number;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  opensAt!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closesAt!: string;
}

export class ReplaceScheduleDto {
  @IsArray() @ArrayMinSize(0) @ArrayMaxSize(28)
  @ValidateNested({ each: true }) @Type(() => ScheduleWindowDto)
  windows!: ScheduleWindowDto[];
}
