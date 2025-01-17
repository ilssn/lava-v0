export interface LinkInfo {
    url: string;
    title?: string;
    description?: string;
    attributes?: {
        [key: string]: string;
    };
    context?: {
        parentText?: string;
        siblingText?: string;
        headings?: string[];
    };
}
export interface FocusPoint {
    id: string;
    focuspoint: string;
    explanation?: string;
}
export interface SchemaField {
    type: 'string' | 'number' | 'float' | 'array' | 'object';
    itemType?: 'string' | 'number' | 'float' | 'object';
    items?: SchemaField;
    properties?: {
        [key: string]: SchemaField;
    };
}
export interface Schema {
    [key: string]: SchemaField;
}
export interface RecursiveConfig {
    maxDepth: number;
    maxUrls?: number;
    urlFilters?: {
        include?: string[];
        exclude?: string[];
        articlePattern?: string;
    };
}
export interface CrawlerTask {
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
export interface ExtractedInfo {
    url: string;
    author: string;
    publishDate: string;
    screenshot: string;
    data: any;
    relatedUrls: {
        internal: {
            href: string;
        }[];
    };
    depth?: number;
    markdown?: any;
    html?: any;
    metadata?: any;
}
export interface CrawlerResponse {
    taskId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    results?: ExtractedInfo[];
}
