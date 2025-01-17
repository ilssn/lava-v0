export interface CrawlerConfig {
    openai: {
        apiKey: string;
        baseUrl: string;
        model: string;
        secondaryModel: string;
    };
    crawler: {
        baseUrl: string;
        token: string;
        headless: boolean;
        maxRequestRetries: number;
        requestHandlerTimeout: number;
        storageDir: string;
    };
    upload: {
        imageUploadUrl: string;
        prefix: string;
    };
}
declare const _default: (() => CrawlerConfig) & import("@nestjs/config").ConfigFactoryKeyHost<CrawlerConfig>;
export default _default;
