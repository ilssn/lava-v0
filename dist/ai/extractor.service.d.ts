import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { Schema } from '../crawler/interfaces/crawler.interface';
import { LinkInfo } from '../crawler/interfaces/crawler.interface';
export declare class ExtractorService {
    private readonly aiService;
    private configService;
    private readonly logger;
    private readonly defaultSchema;
    constructor(aiService: AIService, configService: ConfigService);
    private callModel;
    extractStructuredData(text: string, schema?: Schema, headers?: any): Promise<any>;
    extractRelatedLinks(links: LinkInfo[], target?: string, schema?: Schema, headers?: any): Promise<string[]>;
}
