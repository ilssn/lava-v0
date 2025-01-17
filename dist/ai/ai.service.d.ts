export declare class AIService {
    private readonly logger;
    private readonly openai;
    constructor();
    callModel(prompt: string, model: string, authorization: string, temperature?: number): Promise<string>;
    callModelWithConfig(prompt: string, useSecondaryModel: boolean, config: any, authorization: string): Promise<string>;
}
