import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { Schema } from '../crawler/interfaces/crawler.interface';
import {
  STRUCTURED_DATA_EXTRACTION_PROMPT,
  RELATED_LINKS_EXTRACTION_PROMPT,
} from './prompts/extract.prompt';
import { LinkInfo } from '../crawler/interfaces/crawler.interface';

@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);
  private readonly defaultSchema: Schema = {
    title: { type: 'string' },
    content: { type: 'string' },
    metadata: {
      type: 'object',
      properties: {
        author: { type: 'string' },
        date: { type: 'string' },
        views: { type: 'number' },
        tags: {
          type: 'array',
          itemType: 'string'
        }
      }
    }
  };

  constructor(private readonly aiService: AIService, private configService: ConfigService) { }

  private async callModel(prompt: string, useSecondaryModel = false, authorization: string) {
    const config = this.configService.get('config');
    return this.aiService.callModelWithConfig(prompt, useSecondaryModel, config, authorization);
  }

  async extractStructuredData(text: string, schema?: Schema, headers?: any) {
    const authorization = headers?.authorization;
    try {
      this.logger.debug('Preparing structured data extraction prompt');
      const prompt = STRUCTURED_DATA_EXTRACTION_PROMPT
        .replace('{schema}', JSON.stringify(schema || this.defaultSchema, null, 2))
        .replace('{text}', text);
      this.logger.debug('AI Extract Data Schema: %s', schema);

      this.logger.debug('Calling AI model for structured data extraction');
      const response = await this.callModel(prompt, false, authorization);

      this.logger.debug('Parsing AI response');
      try {
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response: ${response}`);
        throw new Error(`Invalid AI response format: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error(`Error extracting structured data: ${error.message}`);
      throw error;
    }
  }

  async extractRelatedLinks(links: LinkInfo[], target?: string, schema?: Schema, headers?: any): Promise<string[]> {
    const authorization = headers?.authorization;
    try {
      this.logger.debug('Preparing related links extraction prompt');
      const prompt = RELATED_LINKS_EXTRACTION_PROMPT
        .replace('{target}', target || '')
        .replace('{schema}', schema ? JSON.stringify(schema, null, 2) : '{}')
        .replace('{links}', JSON.stringify(links, null, 2));

      this.logger.debug('Calling AI model for related links extraction');
      const response = await this.callModel(prompt, true, authorization);

      this.logger.debug('Parsing AI response');
      let parsedLinks;
      try {
        parsedLinks = JSON.parse(response);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response: ${response}`);
        return [];
      }

      // Remove duplicate links
      return Array.from(new Set(parsedLinks));
    } catch (error) {
      this.logger.error(`Error extracting related links: ${error.message}`);
      throw error;
    }
  }
} 