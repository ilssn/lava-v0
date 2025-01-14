// src/utils/crawlerUtils.js
import axios from 'axios';

export async function submitAndWait(requestData, timeout = 300000) { // timeout in milliseconds
  const baseUrl = 'http://localhost:11235'; // 请根据实际情况修改
  // const baseUrl = 'https://test-crawl4ai.havethefeb.autos'; // 请根据实际情况修改
  const token = 'sk-test1234567890';

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