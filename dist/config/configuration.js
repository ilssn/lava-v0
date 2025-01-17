"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('config', () => ({
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
//# sourceMappingURL=configuration.js.map