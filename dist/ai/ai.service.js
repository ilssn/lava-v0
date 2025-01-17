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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let AIService = AIService_1 = class AIService {
    constructor() {
        this.logger = new common_1.Logger(AIService_1.name);
    }
    async callModel(prompt, model, authorization, temperature = 0) {
        const apiKey = authorization ? authorization.split(' ')[1] : process.env.OPENAI_API_KEY;
        const openai = new openai_1.default({
            apiKey,
            baseURL: process.env.OPENAI_BASE_URL,
        });
        const response = await openai.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
        });
        return response.choices[0].message.content || '';
    }
    async callModelWithConfig(prompt, useSecondaryModel, config, authorization) {
        const model = useSecondaryModel ? config.openai.secondaryModel : config.openai.model;
        return this.callModel(prompt, model, authorization);
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIService);
//# sourceMappingURL=ai.service.js.map