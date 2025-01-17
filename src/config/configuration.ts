import { registerAs } from '@nestjs/config';

export interface CrawlerConfig {
  openai: {
    apiKey: string;
    baseUrl: string;
    model: string;
    secondaryModel: string;
  };
  crawler: {
    baseUrl: string;
    token: string;
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
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    secondaryModel: process.env.OPENAI_SECONDARY_MODEL || 'Qwen2.5-7B-Instruct',
  },
  crawler: {
    baseUrl: process.env.CRAWLER_BASE_URL || 'https://test-crawl4ai.havethefeb.autos',
    token: process.env.CRAWLER_TOKEN || 'sk-test1234567890',
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