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
import * as fs from 'fs/promises';

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

  async startCrawling(task: CrawlerTask): Promise<string> {
    const taskId = uuidv4();
    this.tasks.set(taskId, {
      taskId,
      status: 'pending',
    });

    this.processCrawlerTask(taskId, task).catch((error) => {
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

  private async processCrawlerTask(taskId: string, task: CrawlerTask) {
    try {
      // 初始化已处理URL集合
      this.processedUrls.set(taskId, new Set([task.url]));

      this.tasks.set(taskId, {
        taskId,
        status: 'processing',
      });

      const config = this.configService.get('config');
      const extractorService = this.extractorService;
      const uploadService = this.uploadService;
      const tasks = this.tasks;
      const logger = this.logger;

      logger.debug(`Starting crawler for URL: ${task.url}`);

      // 创建新的存储目录
      const dataDir = path.join(process.cwd(), 'storage', 'datasets', taskId);
      await fs.mkdir(dataDir, { recursive: true });

      // 清理默认存储
      try {
        logger.debug('Purging default storages...');
        await purgeDefaultStorages();
        // 确保存储目录是干净的
        const storageDir = path.join(process.cwd(), 'storage');
        logger.debug('Removing request queues directory...');
        await fs.rm(path.join(storageDir, 'request_queues'), { recursive: true, force: true });
        logger.debug('Removing key value stores directory...');
        await fs.rm(path.join(storageDir, 'key_value_stores'), { recursive: true, force: true });
        logger.debug('Removing default datasets directory...');
        await fs.rm(path.join(storageDir, 'datasets', 'default'), { recursive: true, force: true });
        logger.debug('Storage cleanup completed');
      } catch (error) {
        this.logger.warn(`Error cleaning storages: ${error.message}`);
      }

      // 等待一段时间确保清理完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 重新创建必要的目录
      logger.debug('Creating new storage directories...');
      await fs.mkdir(dataDir, { recursive: true });
      await fs.mkdir(path.join(process.cwd(), 'storage', 'request_queues'), { recursive: true });
      await fs.mkdir(path.join(process.cwd(), 'storage', 'key_value_stores'), { recursive: true });
      logger.debug('Storage directories created');

      // 创建唯一的请求队列
      const requestQueue = await RequestQueue.open(`queue-${taskId}`);
      logger.debug(`Created request queue: queue-${taskId}`);

      const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: task.recursiveConfig?.maxUrls || 1,
        maxRequestRetries: 2,
        requestHandlerTimeoutSecs: 20,
        headless: true,
        navigationTimeoutSecs: 20,
        browserPoolOptions: {
          useFingerprints: false,
        },
        // 使用创建的请求队列
        requestQueue,
        // 配置基本选项
        maxConcurrency: 4,
        // 禁用会话池
        useSessionPool: false,
        persistCookiesPerSession: false,
        // 配置请求处理
        minConcurrency: 2,
        maxRequestsPerMinute: 40,
        // 在处理完一个请求后暂停一下，避免过快
        requestHandler: async ({ request, page, enqueueLinks, log }) => {
          try {
            const url = request.url;
            const depth = request.userData.depth || 0;
            const processedUrls = this.getProcessedUrls(taskId);

            // 如果URL已经处理过，跳过
            if (processedUrls.has(url)) {
              return;
            }
            processedUrls.add(url);

            log.info(`Processing URL: ${request.url}`);

            this.logger.debug(`Current depth: ${depth}, URL: ${url}, Request ID: ${request.id}`);
            this.logger.debug(`Request userData: ${JSON.stringify(request.userData)}`);

            // 添加随机延迟，但减少等待时间
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));

            await page.setExtraHTTPHeaders({
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            });

            // 减少等待时间
            await page.waitForLoadState('domcontentloaded');

            // 截图
            const screenshotPath = path.join(process.cwd(), 'storage', 'screenshots', `${taskId}-${request.id}.png`);
            await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
            await page.screenshot({ path: screenshotPath, fullPage: true });

            const content = await page.content();
            const $ = cheerio.load(content);

            // 提取页面中的所有链接，优化选择器
            const links: LinkInfo[] = [];
            $('a[href]').each((_, element) => {
              const $element = $(element);
              const href = $element.attr('href');
              const text = $element.text().trim();

              if (href) {
                try {
                  const fullUrl = new URL(href, url).href;
                  // 如果有URL模式，检查是否匹配
                  if (!task.recursiveConfig?.urlPattern ||
                    new RegExp(task.recursiveConfig.urlPattern).test(fullUrl)) {

                    // 收集链接的上下文信息
                    const $parent = $element.parent();
                    const $siblings = $parent.children().not(element);
                    const headings: string[] = [];

                    // 收集所在区域的标题层级，限制向上查找的层级
                    let $current = $element;
                    let level = 0;
                    while ($current.length && level < 3) {
                      const $heading = $current.prevAll('h1,h2,h3,h4,h5,h6').first();
                      if ($heading.length) {
                        headings.unshift($heading.text().trim());
                      }
                      $current = $current.parent();
                      level++;
                    }

                    // 构建链接信息
                    const linkInfo: LinkInfo = {
                      url: fullUrl,
                      title: text,
                      description: $element.attr('title') || $element.attr('aria-label'),
                      attributes: element.attribs,
                      context: {
                        parentText: $parent.clone().children().remove().end().text().trim(),
                        siblingText: $siblings.text().trim(),
                        headings: headings.length > 0 ? headings : undefined
                      }
                    };

                    links.push(linkInfo);
                  }
                } catch (e) {
                  this.logger.debug(`Invalid URL: ${href}`);
                }
              }
            });

            const textContent = $('body').text();

            // 提取结构化数据
            const extractedData = await extractorService.extractStructuredData(textContent, task.schema);

            // 上传截图
            let screenshotUrl = '';
            try {
              screenshotUrl = await uploadService.uploadImage(screenshotPath);
            } catch (error) {
              logger.error(`Failed to upload screenshot: ${error.message}`);
            }

            // 获取相关链接并去重
            const relatedUrls = await extractorService.extractRelatedLinks(links, task.target, task.schema);
            const uniqueUrls = [...new Set(relatedUrls)].filter(url => {
              // 如果URL已经处理过，跳过
              if (processedUrls.has(url)) {
                return false;
              }

              // 如果没有配置过滤规则，保留所有链接
              if (!task.recursiveConfig?.urlFilters) return true;

              const { include, exclude, articlePattern } = task.recursiveConfig.urlFilters;

              // 检查排除规则
              if (exclude && exclude.some(pattern => url.includes(pattern))) {
                return false;
              }

              // 检查包含规则
              if (include && !include.some(pattern => url.includes(pattern))) {
                return false;
              }

              // 检查文章模式
              if (articlePattern) {
                try {
                  return new RegExp(articlePattern).test(url);
                } catch (error) {
                  this.logger.warn(`Invalid article pattern: ${articlePattern}`);
                  return true;
                }
              }

              return true;
            });

            // 如果还没有达到最大深度，将符合条件的链接加入队列
            if (depth < (task.recursiveConfig?.maxDepth || 0)) {
              if (uniqueUrls.length > 0) {
                // 将新的URL添加到已处理集合
                uniqueUrls.forEach(url => processedUrls.add(url));

                await enqueueLinks({
                  urls: uniqueUrls,
                  userData: { depth: depth + 1 },
                  label: 'detail',
                  transformRequestFunction: (request) => {
                    request.userData = { ...request.userData, depth: depth + 1 };
                    return request;
                  },
                });
                this.logger.debug(`Enqueued ${uniqueUrls.length} unique URLs at depth ${depth + 1}`);
              }
            }

            const extractedInfo: ExtractedInfo = {
              url,
              author: extractedData.metadata?.author || 'NA',
              publishDate: extractedData.metadata?.date || 'NA',
              screenshot: screenshotUrl,
              data: extractedData,
              relatedUrls,
              depth,
            };

            // 保存结果到任务特定的文件
            const taskFile = path.join(dataDir, `${taskId}.json`);

            // 读取现有结果（如果有）
            let existingResults = [];
            try {
              const existingContent = await fs.readFile(taskFile, 'utf-8');
              existingResults = JSON.parse(existingContent);
            } catch (error) {
              if (error.code !== 'ENOENT') {
                this.logger.error(`Error reading existing results: ${error.message}`);
              }
            }

            // 合并新结果
            const updatedResults = Array.isArray(existingResults)
              ? [...existingResults, extractedInfo]
              : [extractedInfo];

            // 保存更新后的结果
            await fs.writeFile(taskFile, JSON.stringify(updatedResults, null, 2));

            // 更新任务状态
            tasks.set(taskId, {
              taskId,
              status: 'processing',
              results: updatedResults,
            });

            // 记录当前深度的处理情况
            this.logger.debug(`Processed URL ${url} at depth ${depth}`);

          } catch (error) {
            logger.error(`Error processing URL ${request.url}: ${error.message}`);
            if (error instanceof Error) {
              logger.error(error.stack);
            }
          }
        },
        failedRequestHandler({ request, log, error }) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          log.error(`Request ${request.url} failed: ${errorMessage}`);
          logger.error(`Failed request for ${request.url}: ${errorMessage}`);
        },
      });

      try {
        // 直接运行爬虫，不需要提前teardown
        await crawler.run([task.url]);
      } finally {
        try {
          // 在finally块中尝试清理资源
          await crawler.teardown();

          // 清理请求队列
          logger.debug(`Destroying request queue: queue-${taskId}`);
          await requestQueue.drop();

          // 清理存储目录
          logger.debug('Cleaning up task storage...');
          const storageDir = path.join(process.cwd(), 'storage');
          await fs.rm(path.join(storageDir, 'request_queues', `queue-${taskId}`), { recursive: true, force: true });
          await fs.rm(path.join(storageDir, 'key_value_stores', `queue-${taskId}`), { recursive: true, force: true });
        } catch (error) {
          this.logger.warn(`Error during cleanup: ${error.message}`);
        }
        // 设置最终状态
        const finalResults = this.tasks.get(taskId);
        if (finalResults) {
          this.tasks.set(taskId, {
            ...finalResults,
            status: 'completed'
          });
        }
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
} 