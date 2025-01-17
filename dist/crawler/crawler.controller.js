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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerController = void 0;
const common_1 = require("@nestjs/common");
const crawler_service_1 = require("./crawler.service");
const crawler_task_dto_1 = require("./dto/crawler-task.dto");
const schema_service_1 = require("../ai/schema.service");
const auth_guard_1 = require("../guards/auth.guard");
let CrawlerController = class CrawlerController {
    constructor(crawlerService, schemaService) {
        this.crawlerService = crawlerService;
        this.schemaService = schemaService;
    }
    async startCrawling(task, headers) {
        console.log(headers);
        const authorization = headers.authorization;
        const taskId = await this.crawlerService.startCrawling(task, authorization);
        return {
            taskId,
            message: 'Task has been successfully started'
        };
    }
    async getTaskStatus(taskId) {
        const status = this.crawlerService.getTaskStatus(taskId);
        if (!status) {
            throw new common_1.HttpException('Task not found', common_1.HttpStatus.NOT_FOUND);
        }
        return status;
    }
    async generateSchema(description, headers) {
        return this.schemaService.generateSchemaFromDescription(description, headers);
    }
};
exports.CrawlerController = CrawlerController;
__decorate([
    (0, common_1.Post)('task'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crawler_task_dto_1.CrawlerTaskDto, Object]),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "startCrawling", null);
__decorate([
    (0, common_1.Get)('task/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "getTaskStatus", null);
__decorate([
    (0, common_1.Post)('generate-schema'),
    __param(0, (0, common_1.Body)('description')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "generateSchema", null);
exports.CrawlerController = CrawlerController = __decorate([
    (0, common_1.Controller)('crawler'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [crawler_service_1.CrawlerService,
        schema_service_1.SchemaService])
], CrawlerController);
//# sourceMappingURL=crawler.controller.js.map