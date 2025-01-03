import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { FocusPoint } from '../crawler/interfaces/crawler.interface';
import {
  CONTENT_EXTRACTION_PROMPT,
  AUTHOR_DATE_EXTRACTION_PROMPT,
  RELATED_LINKS_EXTRACTION_PROMPT,
  CONTENT_VALIDATION_PROMPT,
} from './prompts/extract.prompt';

@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);
  private readonly openai: OpenAI;

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

  async extractContent(text: string, focusPoints: FocusPoint[]) {
    try {
      this.logger.debug('Preparing content extraction prompt');
      const prompt = CONTENT_EXTRACTION_PROMPT
        .replace('{focusPoints}', JSON.stringify(focusPoints, null, 2))
        .replace('{text}', text);

      this.logger.debug('Calling AI model for content extraction');
      const response = await this.callModel(prompt);

      this.logger.debug('Parsing AI response');
      try {
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response: ${response}`);
        throw new Error(`Invalid AI response format: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error(`Error extracting content: ${error.message}`);
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

  async extractRelatedLinks(text: string, linkDict: Record<string, string>, focusPoints: FocusPoint[]) {
    try {
      this.logger.debug('Preparing related links extraction prompt');
      const prompt = RELATED_LINKS_EXTRACTION_PROMPT
        .replace('{focusPoints}', JSON.stringify(focusPoints, null, 2))
        .replace('{text}', text)
        .replace('{linkDict}', JSON.stringify(linkDict, null, 2));

      this.logger.debug('Calling AI model for related links extraction');
      const response = await this.callModel(prompt, true);

      this.logger.debug('Processing response');
      const match = response.match(/"""([\s\S]*?)"""/);
      if (!match) {
        this.logger.warn('No URLs found between triple quotes');
        return [];
      }

      return match[1]
        .split('\n')
        .map(url => url.trim())
        .filter(url => url && url.startsWith('http'));
    } catch (error) {
      this.logger.error(`Error extracting related links: ${error.message}`);
      throw error;
    }
  }

  async validateContent(content: string, text: string) {
    try {
      this.logger.debug('Preparing content validation prompt');
      const prompt = CONTENT_VALIDATION_PROMPT
        .replace('{content}', content)
        .replace('{text}', text);

      this.logger.debug('Calling AI model for content validation');
      const response = await this.callModel(prompt, true);

      return response.toLowerCase().includes('是');
    } catch (error) {
      this.logger.error(`Error validating content: ${error.message}`);
      throw error;
    }
  }
} 