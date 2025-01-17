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
var SchemaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaService = void 0;
const common_1 = require("@nestjs/common");
const schema_prompt_1 = require("./prompts/schema.prompt");
const ai_service_1 = require("./ai.service");
const config_1 = require("@nestjs/config");
let SchemaService = SchemaService_1 = class SchemaService {
    constructor(aiService, configService) {
        this.aiService = aiService;
        this.configService = configService;
        this.logger = new common_1.Logger(SchemaService_1.name);
    }
    async generateSchemaFromDescription(description, headers) {
        const authorization = headers.authorization;
        const prompt = schema_prompt_1.SCHEMA_GENERATION_PROMPT.replace('{description}', description);
        const config = this.configService.get('config');
        const response = await this.aiService.callModelWithConfig(prompt, false, config, authorization);
        this.logger.debug(`Generated schema: ${response}`);
        try {
            return JSON.parse(response);
        }
        catch (error) {
            this.logger.error(`Failed to parse schema response: ${response}`);
            throw new Error('Invalid schema format');
        }
    }
};
exports.SchemaService = SchemaService;
exports.SchemaService = SchemaService = SchemaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AIService, config_1.ConfigService])
], SchemaService);
//# sourceMappingURL=schema.service.js.map