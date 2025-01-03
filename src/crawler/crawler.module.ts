import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { ExtractorService } from '../ai/extractor.service';
import { UploadService } from './upload.service';

@Module({
  controllers: [CrawlerController],
  providers: [CrawlerService, ExtractorService, UploadService],
  exports: [CrawlerService],
})
export class CrawlerModule { } 