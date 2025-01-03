import { registerAs } from '@nestjs/config';

export interface CrawlerConfig {
  openai: {
    apiKey: string;
    baseUrl: string;
    model: string;
    secondaryModel: string;
  };
  crawler: {
    headless: boolean;
    maxRequestRetries: number;
    requestHandlerTimeout: number;
    storageDir: string;
  };
  upload: {
    imageUploadUrl: string;
    prefix: string;
  };
}

export default registerAs('config', (): CrawlerConfig => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-16k',
    secondaryModel: process.env.OPENAI_SECONDARY_MODEL || 'gpt-3.5-turbo',
  },
  crawler: {
    headless: process.env.CRAWLER_HEADLESS === 'true',
    maxRequestRetries: parseInt(process.env.MAX_REQUEST_RETRIES || '2', 10),
    requestHandlerTimeout: parseInt(process.env.REQUEST_HANDLER_TIMEOUT || '300000', 10),
    storageDir: process.env.STORAGE_DIR || './storage',
  },
  upload: {
    imageUploadUrl: process.env.IMAGE_UPLOAD_URL || 'https://dash-api.302.ai/gpt/api/upload/gpt/image',
    prefix: process.env.IMAGE_UPLOAD_PREFIX || 'lava-data',
  },
})); 