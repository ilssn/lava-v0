import { CrawlerService } from './crawler.service';
import { CrawlerResponse } from './interfaces/crawler.interface';
import { CrawlerTaskDto } from './dto/crawler-task.dto';
import { SchemaService } from '../ai/schema.service';
export declare class CrawlerController {
    private readonly crawlerService;
    private readonly schemaService;
    constructor(crawlerService: CrawlerService, schemaService: SchemaService);
    startCrawling(task: CrawlerTaskDto, headers: any): Promise<{
        taskId: string;
        message: string;
    }>;
    getTaskStatus(taskId: string): Promise<CrawlerResponse>;
    generateSchema(description: string, headers: any): Promise<any>;
}
