import { Injectable, Logger } from '@nestjs/common';
import { SCHEMA_GENERATION_PROMPT } from './prompts/schema.prompt';
import { AIService } from './ai.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SchemaService {
  private readonly logger = new Logger(SchemaService.name);

  constructor(private readonly aiService: AIService, private configService: ConfigService) { }

  async generateSchemaFromDescription(description: string): Promise<any> {
    const prompt = SCHEMA_GENERATION_PROMPT.replace('{description}', description);
    const config = this.configService.get('config');
    const response = await this.aiService.callModelWithConfig(prompt, false, config);
    this.logger.debug(`Generated schema: ${response}`);
    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.error(`Failed to parse schema response: ${response}`);
      throw new Error('Invalid schema format');
    }
  }
} 