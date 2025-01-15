import { IsArray, IsString, ValidateNested, IsObject, IsOptional, IsBoolean, IsNumber } from 'class-validator';
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

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  proxyConfig?: {
    proxyUrl: string;
    proxyUsername: string;
    proxyPassword: string;
  };

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  browserConfig?: {
    headless: boolean;
    browserType: string;
    viewportWidth: number;
    viewportHeight: number;
    userAgent: string;
    cacheEnabled: boolean;
    jsEnabled: boolean;
    lightMode: boolean;
    textMode: boolean;
    cookies: Array<{ url: string }>;
    headers: Record<string, string>;
  };
} 