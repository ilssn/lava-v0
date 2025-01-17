import { ConfigService } from '@nestjs/config';
import { CrawlerTask, CrawlerResponse } from './interfaces/crawler.interface';
import { ExtractorService } from '../ai/extractor.service';
import { UploadService } from './upload.service';
export declare class CrawlerService {
    private configService;
    private extractorService;
    private uploadService;
    private readonly logger;
    private readonly tasks;
    private readonly processedUrls;
    constructor(configService: ConfigService, extractorService: ExtractorService, uploadService: UploadService);
    startCrawling(task: CrawlerTask, authorization: string): Promise<string>;
    getTaskStatus(taskId: string): Promise<CrawlerResponse>;
    private getProcessedUrls;
    private processCrawlerTask;
    private getPageInfo;
}
