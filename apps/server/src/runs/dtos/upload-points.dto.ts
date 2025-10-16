import {
  IsArray,
  IsNumber,
  IsDateString,
  IsOptional,
  ValidateNested,
  ArrayMaxSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RunPointDto {
  @IsNumber()
  @Min(0)
  seq: number;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsDateString()
  recordedAt: string;

  @IsOptional()
  @IsNumber()
  elevationM?: number;

  @IsOptional()
  @IsNumber()
  speedMps?: number;

  @IsOptional()
  @IsNumber()
  bearingDeg?: number;

  @IsOptional()
  @IsNumber()
  accuracyM?: number;
}

export class UploadPointsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RunPointDto)
  @ArrayMaxSize(100)
  points: RunPointDto[];
}
