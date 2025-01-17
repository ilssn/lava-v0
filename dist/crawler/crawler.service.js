"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CrawlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crawlee_1 = require("crawlee");
const uuid_1 = require("uuid");
const extractor_service_1 = require("../ai/extractor.service");
const upload_service_1 = require("./upload.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const crawlerUtils_1 = require("../utils/crawlerUtils");
let CrawlerService = CrawlerService_1 = class CrawlerService {
    constructor(configService, extractorService, uploadService) {
        this.configService = configService;
        this.extractorService = extractorService;
        this.uploadService = uploadService;
        this.logger = new common_1.Logger(CrawlerService_1.name);
        this.tasks = new Map();
        this.processedUrls = new Map();
    }
    async startCrawling(task, authorization) {
        const taskId = (0, uuid_1.v4)();
        this.tasks.set(taskId, {
            taskId,
            status: 'pending',
        });
        this.processCrawlerTask(taskId, task, authorization).catch((error) => {
            this.logger.error(`Error processing task ${taskId}: ${error.message}`);
            this.tasks.set(taskId, {
                taskId,
                status: 'failed',
                error: error.message,
            });
        });
        return taskId;
    }
    async getTaskStatus(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.results) {
            return task;
        }
        const dataDir = path.join(process.cwd(), 'storage', 'datasets', taskId);
        const taskFile = path.join(dataDir, `${taskId}.json`);
        try {
            const content = await fs.readFile(taskFile, 'utf-8');
            const results = JSON.parse(content);
            const updatedTask = {
                ...task,
                results: Array.isArray(results) ? results : [results]
            };
            this.tasks.set(taskId, updatedTask);
            return updatedTask;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return task;
            }
            this.logger.error(`Error reading task results for ${taskId}: ${error.message}`);
            throw error;
        }
    }
    getProcessedUrls(taskId) {
        if (!this.processedUrls.has(taskId)) {
            this.processedUrls.set(taskId, new Set());
        }
        return this.processedUrls.get(taskId);
    }
    async processCrawlerTask(taskId, task, authorization) {
        try {
            this.processedUrls.set(taskId, new Set(task.urls));
            this.tasks.set(taskId, {
                taskId,
                status: 'processing',
            });
            const config = this.configService.get('config');
            const extractorService = this.extractorService;
            const uploadService = this.uploadService;
            const tasks = this.tasks;
            const logger = this.logger;
            logger.debug(`Starting crawler for URLs: ${task.urls.join(', ')}`);
            const dataDir = path.join(process.cwd(), 'storage', 'datasets', taskId);
            await fs.mkdir(dataDir, { recursive: true });
            const requestQueue = await crawlee_1.RequestQueue.open(`queue-${taskId}`);
            logger.debug(`Created request queue: queue-${taskId}`);
            let processedCount = 0;
            const maxUrls = task.recursiveConfig?.maxUrls || task.urls.length;
            const maxDepth = task.recursiveConfig?.maxDepth || 1;
            for (const url of task.urls) {
                await requestQueue.addRequest({ url, userData: { depth: 1 } });
            }
            while (processedCount < maxUrls) {
                const request = await requestQueue.fetchNextRequest();
                if (!request)
                    break;
                const url = request.url;
                const depth = request.userData.depth || 1;
                logger.log(`Processing URL: ${url} at depth ${depth} (${processedCount + 1}/${maxUrls})`);
                try {
                    const pageInfo = await this.getPageInfo(task, url, authorization);
                    pageInfo.depth = depth;
                    const screenshotPath = path.join(process.cwd(), 'storage', 'screenshots', `${taskId}-${request.id}.png`);
                    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
                    await fs.writeFile(screenshotPath, pageInfo.screenshot, 'base64');
                    const imageUrl = await uploadService.uploadImage(screenshotPath);
                    logger.debug(`Uploaded image: ${imageUrl}`);
                    const pageData = {
                        url: pageInfo.url,
                        screenshot: imageUrl,
                        data: pageInfo.data,
                        metadata: pageInfo.metadata,
                        markdown: pageInfo.markdown,
                        html: pageInfo.html,
                        depth: pageInfo.depth,
                    };
                    const dataFile = path.join(dataDir, `${taskId}.json`);
                    const currentTask = tasks.get(taskId);
                    const currentData = currentTask?.results ? [...currentTask.results, pageData] : [pageData];
                    await fs.writeFile(dataFile, JSON.stringify(currentData, null, 2), 'utf-8');
                    logger.debug(`Saved page data to ${dataFile}`);
                    if (currentTask) {
                        const updatedResults = currentTask.results ? [...currentTask.results, pageData] : [pageData];
                        tasks.set(taskId, {
                            ...currentTask,
                            results: updatedResults,
                        });
                    }
                    const relatedUrls = pageInfo.relatedUrls.internal;
                    if (depth < maxDepth) {
                        for (const relatedUrlObj of relatedUrls) {
                            const relatedUrl = relatedUrlObj.href;
                            if (!this.getProcessedUrls(taskId).has(relatedUrl)) {
                                await requestQueue.addRequest({ url: relatedUrl, userData: { depth: depth + 1 } });
                                this.getProcessedUrls(taskId).add(relatedUrl);
                            }
                        }
                    }
                    processedCount++;
                    await requestQueue.markRequestHandled(request);
                }
                catch (error) {
                    logger.error(`Error processing URL ${url}: ${error.message}`);
                    this.tasks.set(taskId, {
                        taskId,
                        status: 'failed',
                        error: error.message,
                    });
                    break;
                }
            }
            logger.debug(`Destroying request queue: queue-${taskId}`);
            await requestQueue.drop();
            const finalResults = this.tasks.get(taskId);
            if (finalResults && finalResults.status !== 'failed') {
                this.tasks.set(taskId, {
                    ...finalResults,
                    status: 'completed',
                });
            }
        }
        catch (error) {
            this.logger.error(`Error in crawler task ${taskId}: ${error.message}`);
            this.tasks.set(taskId, {
                taskId,
                status: 'failed',
                error: error.message,
            });
            throw error;
        }
    }
    async getPageInfo(task, currentUrl, authorization) {
        this.logger.debug(`Getting page info for ${currentUrl}`);
        const crawler_params = {
            verbose: true,
            magic: true,
            word_count_threshold: 5,
            headless: task.browserConfig?.headless,
            browser_type: task.browserConfig?.browserType,
            viewport_width: task.browserConfig?.viewportWidth,
            viewport_height: task.browserConfig?.viewportHeight,
            light_mode: task.browserConfig?.lightMode,
            text_mode: task.browserConfig?.textMode,
            js_enabled: task.browserConfig?.jsEnabled,
        };
        if (task.proxyConfig && task.proxyConfig.proxyUrl) {
            crawler_params.proxy_config = {
                server: task.proxyConfig.proxyUrl,
                username: task.proxyConfig.proxyUsername,
                password: task.proxyConfig.proxyPassword,
            };
        }
        if (task.browserConfig?.cookies) {
            crawler_params.cookies = task.browserConfig.cookies;
        }
        if (task.browserConfig?.headers) {
            crawler_params.headers = task.browserConfig.headers;
        }
        if (task.browserConfig?.userAgent) {
            crawler_params.user_agent = task.browserConfig.userAgent;
        }
        const requestBody = {
            urls: currentUrl,
            screenshot: true,
            cache_mode: task.browserConfig?.cacheEnabled ? "enabled" : "disabled",
            extraction_config: {
                type: 'llm',
                params: {
                    provider: this.configService.get('config.openai.model'),
                    base_url: this.configService.get('config.openai.baseUrl'),
                    api_token: authorization.split(' ')[1],
                    instruction: task.target,
                    extract_type: 'schema',
                    schema: task.schema
                }
            },
            crawler_params: crawler_params
        };
        this.logger.debug(`Request body: ${JSON.stringify(requestBody)}`);
        try {
            const { result } = await (0, crawlerUtils_1.submitAndWait)(requestBody);
            return {
                url: currentUrl,
                screenshot: result.screenshot,
                data: JSON.parse(result.extracted_content),
                metadata: result.metadata,
                relatedUrls: result.links,
                markdown: result.markdown,
                html: result.cleaned_html,
                depth: 0,
                author: result.author || 'Unknown',
                publishDate: result.publishDate || 'Unknown',
            };
        }
        catch (error) {
            this.logger.error(`Error creating task: ${error.message}`);
            throw error;
        }
    }
};
exports.CrawlerService = CrawlerService;
exports.CrawlerService = CrawlerService = CrawlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        extractor_service_1.ExtractorService,
        upload_service_1.UploadService])
], CrawlerService);
//# sourceMappingURL=crawler.service.js.map