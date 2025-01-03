import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerResponse } from './interfaces/crawler.interface';
import { CrawlerTaskDto } from './dto/crawler-task.dto';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) { }

  @Post('task')
  async createTask(@Body() task: CrawlerTaskDto): Promise<{ taskId: string }> {
    try {
      const taskId = await this.crawlerService.startCrawling(task);
      return { taskId };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to start crawler task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('task/:taskId')
  async getTaskStatus(@Param('taskId') taskId: string): Promise<CrawlerResponse> {
    const status = this.crawlerService.getTaskStatus(taskId);
    if (!status) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }
} 