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
import { SchemaService } from '../ai/schema.service';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly schemaService: SchemaService
  ) { }

  @Post('task')
  async startCrawling(@Body() task: CrawlerTaskDto): Promise<{ taskId: string, message: string }> {
    const taskId = await this.crawlerService.startCrawling(task);
    return {
      taskId,
      message: 'Task has been successfully started'
    };
  }

  @Get('task/:taskId')
  async getTaskStatus(@Param('taskId') taskId: string): Promise<CrawlerResponse> {
    const status = this.crawlerService.getTaskStatus(taskId);
    if (!status) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }

  @Post('generate-schema')
  async generateSchema(@Body('description') description: string): Promise<any> {
    return this.schemaService.generateSchemaFromDescription(description);
  }
} 