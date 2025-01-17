"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAndWait = submitAndWait;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
async function submitAndWait(requestData, timeout = 300000) {
    const configService = new config_1.ConfigService();
    const baseUrl = configService.get('CRAWLER_BASE_URL');
    const token = configService.get('CRAWLER_TOKEN');
    try {
        const response = await axios_1.default.post(`${baseUrl}/crawl`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const taskId = response.data.task_id;
        console.log(`Task ID: ${taskId}`);
        const startTime = Date.now();
        while (true) {
            if (Date.now() - startTime > timeout) {
                throw new Error(`Task ${taskId} did not complete within ${timeout / 1000} seconds`);
            }
            const result = await axios_1.default.get(`${baseUrl}/task/${taskId}`, {
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
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    catch (error) {
        console.error(`Error in submitAndWait: ${error.message}`);
        throw error;
    }
}
module.exports = { submitAndWait };
//# sourceMappingURL=crawlerUtils.js.map