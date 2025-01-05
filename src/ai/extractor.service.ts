import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Schema } from '../crawler/interfaces/crawler.interface';
import {
  STRUCTURED_DATA_EXTRACTION_PROMPT,
  AUTHOR_DATE_EXTRACTION_PROMPT,
  RELATED_LINKS_EXTRACTION_PROMPT,
} from './prompts/extract.prompt';

@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);
  private readonly openai: OpenAI;
  private readonly defaultSchema: Schema = {
    title: { type: 'string' },
    price: { type: 'float' },
    description: { type: 'string' },
    specifications: {
      type: 'array',
      items: {
        name: { type: 'string' },
        value: { type: 'string' }
      }
    }
  };

  constructor(private configService: ConfigService) {
    const config = this.configService.get('config');

    this.logger.debug('Initializing OpenAI configuration');
    this.logger.debug(`Base URL: ${config.openai.baseUrl}`);
    this.logger.debug(`Primary Model: ${config.openai.model}`);
    this.logger.debug(`Secondary Model: ${config.openai.secondaryModel}`);

    this.openai = this.createOpenAIInstance();
  }

  private createOpenAIInstance() {
    return new OpenAI({
      apiKey: this.configService.get('config').openai.apiKey,
      baseURL: this.configService.get('config').openai.baseUrl,
      defaultHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  private async callModel(prompt: string, useSecondaryModel = false) {
    const config = this.configService.get('config');
    const response = await this.openai.chat.completions.create({
      model: useSecondaryModel ? config.openai.secondaryModel : config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    return response.choices[0].message.content || '';
  }

  async extractStructuredData(text: string, schema?: Schema) {
    try {
      this.logger.debug('Preparing structured data extraction prompt');
      const prompt = STRUCTURED_DATA_EXTRACTION_PROMPT
        .replace('{schema}', JSON.stringify(schema || this.defaultSchema, null, 2))
        .replace('{text}', text);

      this.logger.debug('Calling AI model for structured data extraction');
      const response = await this.callModel(prompt);

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

  async extractAuthorAndDate(text: string) {
    try {
      this.logger.debug('Preparing author and date extraction prompt');
      const prompt = AUTHOR_DATE_EXTRACTION_PROMPT.replace('{text}', text);

      this.logger.debug('Calling AI model for author and date extraction');
      const response = await this.callModel(prompt, true);

      this.logger.debug('Parsing AI response');
      try {
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response: ${response}`);
        throw new Error(`Invalid AI response format: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error(`Error extracting author and date: ${error.message}`);
      throw error;
    }
  }

  async extractRelatedLinks(text: string, linkDict: Record<string, string>, schema?: Schema) {
    try {
      this.logger.debug('Preparing related links extraction prompt');
      const prompt = RELATED_LINKS_EXTRACTION_PROMPT
        .replace('{schema}', JSON.stringify(schema || this.defaultSchema, null, 2))
        .replace('{text}', text)
        .replace('{linkDict}', JSON.stringify(linkDict, null, 2));

      this.logger.debug('Calling AI model for related links extraction');
      const response = await this.callModel(prompt, true);

      this.logger.debug('Parsing AI response');
      try {
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response: ${response}`);
        return [];
      }
    } catch (error) {
      this.logger.error(`Error extracting related links: ${error.message}`);
      throw error;
    }
  }
} 