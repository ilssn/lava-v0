import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { ExtractorService } from '../ai/extractor.service';
import { ConfigService } from '@nestjs/config';
import { AIModule } from '../ai/ai.module';
import { UploadService } from './upload.service';
import { SchemaService } from '../ai/schema.service';

@Module({
  imports: [AIModule],
  controllers: [CrawlerController],
  providers: [CrawlerService, ExtractorService, ConfigService, UploadService, SchemaService],
})
export class CrawlerModule { } 