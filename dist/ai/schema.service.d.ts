import { AIService } from './ai.service';
import { ConfigService } from '@nestjs/config';
export declare class SchemaService {
    private readonly aiService;
    private configService;
    private readonly logger;
    constructor(aiService: AIService, configService: ConfigService);
    generateSchemaFromDescription(description: string, headers: any): Promise<any>;
}
