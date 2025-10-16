import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RunMode } from '../entities/run.entity';

export class CreateRunDto {
  @IsEnum(RunMode)
  mode: RunMode;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}
