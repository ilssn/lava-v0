import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;

  constructor() {
    // this.openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY, // 确保在环境变量中设置了 API Key
    //   baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    // });
  }

  async callModel(prompt: string, model: string, authorization: string, temperature: number = 0): Promise<string> {
    const apiKey = authorization ? authorization.split(' ')[1] : process.env.OPENAI_API_KEY;
    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    return response.choices[0].message.content || '';
  }

  async callModelWithConfig(prompt: string, useSecondaryModel: boolean, config: any, authorization: string): Promise<string> {
    const model = useSecondaryModel ? config.openai.secondaryModel : config.openai.model;
    return this.callModel(prompt, model, authorization);
  }
} 