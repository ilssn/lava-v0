"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_service_1 = require("./ai.service");
const extract_prompt_1 = require("./prompts/extract.prompt");
let ExtractorService = ExtractorService_1 = class ExtractorService {
    constructor(aiService, configService) {
        this.aiService = aiService;
        this.configService = configService;
        this.logger = new common_1.Logger(ExtractorService_1.name);
        this.defaultSchema = {
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
    }
    async callModel(prompt, useSecondaryModel = false, authorization) {
        const config = this.configService.get('config');
        return this.aiService.callModelWithConfig(prompt, useSecondaryModel, config, authorization);
    }
    async extractStructuredData(text, schema, headers) {
        const authorization = headers?.authorization;
        try {
            this.logger.debug('Preparing structured data extraction prompt');
            const prompt = extract_prompt_1.STRUCTURED_DATA_EXTRACTION_PROMPT
                .replace('{schema}', JSON.stringify(schema || this.defaultSchema, null, 2))
                .replace('{text}', text);
            this.logger.debug('AI Extract Data Schema: %s', schema);
            this.logger.debug('Calling AI model for structured data extraction');
            const response = await this.callModel(prompt, false, authorization);
            this.logger.debug('Parsing AI response');
            try {
                return JSON.parse(response);
            }
            catch (parseError) {
                this.logger.error(`Failed to parse AI response: ${response}`);
                throw new Error(`Invalid AI response format: ${parseError.message}`);
            }
        }
        catch (error) {
            this.logger.error(`Error extracting structured data: ${error.message}`);
            throw error;
        }
    }
    async extractRelatedLinks(links, target, schema, headers) {
        const authorization = headers?.authorization;
        try {
            this.logger.debug('Preparing related links extraction prompt');
            const prompt = extract_prompt_1.RELATED_LINKS_EXTRACTION_PROMPT
                .replace('{target}', target || '')
                .replace('{schema}', schema ? JSON.stringify(schema, null, 2) : '{}')
                .replace('{links}', JSON.stringify(links, null, 2));
            this.logger.debug('Calling AI model for related links extraction');
            const response = await this.callModel(prompt, true, authorization);
            this.logger.debug('Parsing AI response');
            let parsedLinks;
            try {
                parsedLinks = JSON.parse(response);
            }
            catch (parseError) {
                this.logger.error(`Failed to parse AI response: ${response}`);
                return [];
            }
            return Array.from(new Set(parsedLinks));
        }
        catch (error) {
            this.logger.error(`Error extracting related links: ${error.message}`);
            throw error;
        }
    }
};
exports.ExtractorService = ExtractorService;
exports.ExtractorService = ExtractorService = ExtractorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AIService, config_1.ConfigService])
], ExtractorService);
//# sourceMappingURL=extractor.service.js.map