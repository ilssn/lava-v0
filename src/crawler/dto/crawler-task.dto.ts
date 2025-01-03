import { IsString, IsOptional, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class FocusPointDto {
  @IsString()
  id: string;

  @IsString()
  focuspoint: string;

  @IsString()
  @IsOptional()
  explanation?: string;
}

export class RecursiveConfigDto {
  @IsNumber()
  maxDepth: number;

  @IsNumber()
  @IsOptional()
  maxUrls?: number;

  @IsString()
  @IsOptional()
  urlPattern?: string;

  @IsString()
  @IsOptional()
  excludePattern?: string;
}

export class CrawlerTaskDto {
  @IsString()
  url: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecursiveConfigDto)
  recursiveConfig?: RecursiveConfigDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FocusPointDto)
  focusPoints?: FocusPointDto[];
} 