export declare class CrawlerTaskDto {
    urls: string[];
    target: string;
    schema: any;
    recursiveConfig?: {
        maxUrls?: number;
        maxDepth?: number;
        urlFilters?: {
            include?: string[];
            exclude?: string[];
            articlePattern?: string;
        };
    };
    proxyConfig?: {
        proxyUrl: string;
        proxyUsername: string;
        proxyPassword: string;
    };
    browserConfig?: {
        headless: boolean;
        browserType: string;
        viewportWidth: number;
        viewportHeight: number;
        userAgent: string;
        cacheEnabled: boolean;
        jsEnabled: boolean;
        lightMode: boolean;
        textMode: boolean;
        cookies: Array<{
            url: string;
        }>;
        headers: Record<string, string>;
    };
}
