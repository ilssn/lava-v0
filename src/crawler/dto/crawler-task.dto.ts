import { IsString, IsOptional, IsNumber, ValidateNested, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SchemaFieldDto {
  @IsEnum(['string', 'number', 'float', 'array', 'object'])
  type: 'string' | 'number' | 'float' | 'array' | 'object';

  @IsOptional()
  @IsEnum(['string', 'number', 'float', 'object'])
  itemType?: 'string' | 'number' | 'float' | 'object';

  @IsOptional()
  @ValidateNested()
  @Type(() => SchemaFieldDto)
  items?: SchemaFieldDto;

  @IsOptional()
  @IsObject()
  properties?: {
    [key: string]: SchemaFieldDto;
  };
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
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SchemaFieldDto)
  schema?: {
    [key: string]: SchemaFieldDto;
  };
} 