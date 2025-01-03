import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import axios from 'axios';
import * as fs from 'fs/promises';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) { }

  async uploadImage(filePath: string): Promise<string> {
    try {
      const config = this.configService.get('config');
      const formData = new FormData();

      // 读取文件
      const fileBuffer = await fs.readFile(filePath);

      // 添加文件到表单
      formData.append('file', fileBuffer, {
        filename: 'screenshot.png',
        contentType: 'image/png',
      });

      // 添加前缀
      formData.append('prefix', config.upload.prefix);

      // 发送请求
      const response = await axios.post(config.upload.imageUploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (response.data.code === 0 && response.data.data?.url) {
        return response.data.data.url;
      } else {
        throw new Error(`Upload failed: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`);
      throw error;
    } finally {
      // 清理临时文件
      try {
        await fs.unlink(filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete temporary file ${filePath}: ${error.message}`);
      }
    }
  }
} 