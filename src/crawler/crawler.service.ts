import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlaywrightCrawler, purgeDefaultStorages, RequestQueue } from 'crawlee';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import {
  CrawlerTask,
  ExtractedInfo,
  CrawlerResponse,
  LinkInfo,
} from './interfaces/crawler.interface';
import { ExtractorService } from '../ai/extractor.service';
import { UploadService } from './upload.service';
import * as path from 'path';
import * as fs from 'fs/promises'
// import axios from 'axios';
import { submitAndWait } from '../utils/crawlerUtils';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly tasks: Map<string, CrawlerResponse> = new Map();
  private readonly processedUrls: Map<string, Set<string>> = new Map(); // 每个任务的已处理URL集合

  constructor(
    private configService: ConfigService,
    private extractorService: ExtractorService,
    private uploadService: UploadService,
  ) { }

  async startCrawling(task: CrawlerTask, authorization: string): Promise<string> {
    const taskId = uuidv4();
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

  async getTaskStatus(taskId: string): Promise<CrawlerResponse> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 如果任务已经有结果，直接返回
    if (task.results) {
      return task;
    }

    // 读取该任务的数据文件
    const dataDir = path.join(process.cwd(), 'storage', 'datasets', taskId);
    const taskFile = path.join(dataDir, `${taskId}.json`);

    try {
      const content = await fs.readFile(taskFile, 'utf-8');
      const results = JSON.parse(content);

      // 更新任务状态中的结果
      const updatedTask = {
        ...task,
        results: Array.isArray(results) ? results : [results]
      };
      this.tasks.set(taskId, updatedTask);

      return updatedTask;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在，返回当前任务状态
        return task;
      }
      this.logger.error(`Error reading task results for ${taskId}: ${error.message}`);
      throw error;
    }
  }

  private getProcessedUrls(taskId: string): Set<string> {
    if (!this.processedUrls.has(taskId)) {
      this.processedUrls.set(taskId, new Set());
    }
    return this.processedUrls.get(taskId)!;
  }

  private async processCrawlerTask(taskId: string, task: CrawlerTask, authorization: string) {
    try {
      // 初始化已处理URL集合
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

      // 创建新的存储目录
      const dataDir = path.join(process.cwd(), 'storage', 'datasets', taskId);
      await fs.mkdir(dataDir, { recursive: true });

      // 创建唯一的请求队列
      const requestQueue = await RequestQueue.open(`queue-${taskId}`);
      logger.debug(`Created request queue: queue-${taskId}`);

      // 添加计数器
      let processedCount = 0;
      const maxUrls = task.recursiveConfig?.maxUrls || task.urls.length;
      const maxDepth = task.recursiveConfig?.maxDepth || 1;

      // 将所有初始URL加入队列，初始深度为1
      for (const url of task.urls) {
        await requestQueue.addRequest({ url, userData: { depth: 1 } });
      }

      while (processedCount < maxUrls) {
        const request = await requestQueue.fetchNextRequest();
        if (!request) break;

        const url = request.url;
        const depth = request.userData.depth || 1;
        logger.log(`Processing URL: ${url} at depth ${depth} (${processedCount + 1}/${maxUrls})`);

        try {
          // 获取页面信息
          const pageInfo = await this.getPageInfo(task, url, authorization);
          pageInfo.depth = depth; // 在 pageInfo 中添加深度信息

          // 处理页面信息（例如，保存数据、截图等）
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

          // 保存页面数据到文件
          const dataFile = path.join(dataDir, `${taskId}.json`);
          const currentTask = tasks.get(taskId);
          const currentData = currentTask?.results ? [...currentTask.results, pageData] : [pageData];
          await fs.writeFile(dataFile, JSON.stringify(currentData, null, 2), 'utf-8');
          logger.debug(`Saved page data to ${dataFile}`);

          // 更新任务状态中的结果
          if (currentTask) {
            const updatedResults = currentTask.results ? [...currentTask.results, pageData] : [pageData as any];
            tasks.set(taskId, {
              ...currentTask,
              results: updatedResults,
            });
          }

          // 从页面信息中提取相关链接
          const relatedUrls = pageInfo.relatedUrls.internal;

          // 如果当前深度小于最大深度，将相关链接加入队列
          if (depth < maxDepth) {
            for (const relatedUrlObj of relatedUrls) {
              const relatedUrl = relatedUrlObj.href; // 提取 href 属性
              if (!this.getProcessedUrls(taskId).has(relatedUrl)) {
                await requestQueue.addRequest({ url: relatedUrl, userData: { depth: depth + 1 } });
                this.getProcessedUrls(taskId).add(relatedUrl);
              }
            }
          }

          processedCount++;
          await requestQueue.markRequestHandled(request);
        } catch (error) {
          logger.error(`Error processing URL ${url}: ${error.message}`);
          // 更新任务状态为失败
          this.tasks.set(taskId, {
            taskId,
            status: 'failed',
            error: error.message,
          });
          break; // 结束任务
        }
      }

      // 清理请求队列
      logger.debug(`Destroying request queue: queue-${taskId}`);
      await requestQueue.drop();

      // 设置最终状态
      const finalResults = this.tasks.get(taskId);
      if (finalResults && finalResults.status !== 'failed') {
        this.tasks.set(taskId, {
          ...finalResults,
          status: 'completed',
        });
      }
    } catch (error) {
      this.logger.error(`Error in crawler task ${taskId}: ${error.message}`);
      this.tasks.set(taskId, {
        taskId,
        status: 'failed',
        error: error.message,
      });
      throw error;
    }
  }

  private async getPageInfo(task: CrawlerTask, currentUrl: string, authorization: string): Promise<ExtractedInfo> {
    this.logger.debug(`Getting page info for ${currentUrl}`);

    const crawler_params: any = {
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
    }
    if (task.proxyConfig && task.proxyConfig.proxyUrl) {
      crawler_params.proxy_config = {
        server: task.proxyConfig.proxyUrl,
        username: task.proxyConfig.proxyUsername,
        password: task.proxyConfig.proxyPassword,
      }
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
    // 定义请求体
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
      const { result } = await submitAndWait(requestBody);
      return {
        url: currentUrl,
        screenshot: result.screenshot,
        data: JSON.parse(result.extracted_content),
        metadata: result.metadata,
        relatedUrls: result.links, // 确保 relatedUrls.internal 是一个字符串数组,
        markdown: result.markdown,
        html: result.cleaned_html,
        depth: 0, // 初始化 depth 属性
        author: result.author || 'Unknown', // 提供默认值或从 result 中获取
        publishDate: result.publishDate || 'Unknown', // 提供默认值或从 result 中获取
      }
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`);
      throw error;
    }
  }


} 