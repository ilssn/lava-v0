// src/utils/crawlerUtils.js
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

export async function submitAndWait(requestData, timeout = 300000) { // timeout in milliseconds
  const configService = new ConfigService(); // 创建 ConfigService 实例
  const baseUrl = configService.get('CRAWLER_BASE_URL'); // 获取 CRAWLER_BASE_URL
  const token = configService.get('CRAWLER_TOKEN'); // 获取 CRAWLER_TOKEN

  try {
    // 提交爬虫任务
    const response = await axios.post(`${baseUrl}/crawl`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const taskId = response.data.task_id;
    console.log(`Task ID: ${taskId}`);

    // 轮询结果
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Task ${taskId} did not complete within ${timeout / 1000} seconds`);
      }

      const result = await axios.get(`${baseUrl}/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const status = result.data;

      if (status.status === 'failed') {
        console.error('Task failed:', status.error);
        throw new Error(`Task failed: ${status.error}`);
      }

      if (status.status === 'completed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
    }
  } catch (error) {
    console.error(`Error in submitAndWait: ${error.message}`);
    throw error;
  }
}

module.exports = { submitAndWait };