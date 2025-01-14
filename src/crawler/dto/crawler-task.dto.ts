import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CrawlerTaskDto {
  @IsArray()
  @IsString({ each: true })
  urls: string[];

  @IsString()
  target: string;

  @ValidateNested()
  @Type(() => Object)
  schema: any;

  @ValidateNested()
  @Type(() => Object)
  recursiveConfig?: {
    maxUrls?: number;
    maxDepth?: number;
    urlFilters?: {
      include?: string[];
      exclude?: string[];
      articlePattern?: string;
    };
  };
} 