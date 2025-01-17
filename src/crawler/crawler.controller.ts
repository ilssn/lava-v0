import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerResponse } from './interfaces/crawler.interface';
import { CrawlerTaskDto } from './dto/crawler-task.dto';
import { SchemaService } from '../ai/schema.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('crawler')
@UseGuards(AuthGuard)
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly schemaService: SchemaService
  ) { }

  @Post('task')
  async startCrawling(
    @Body() task: CrawlerTaskDto,
    @Headers() headers: any
  ): Promise<{ taskId: string, message: string }> {
    console.log(headers);
    const authorization = headers.authorization;
    const taskId = await this.crawlerService.startCrawling(task, authorization);
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
  async generateSchema(@Body('description') description: string, @Headers() headers: any): Promise<any> {
    return this.schemaService.generateSchemaFromDescription(description, headers);
  }
} 