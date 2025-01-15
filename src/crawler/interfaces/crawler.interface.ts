export interface LinkInfo {
  url: string;
  title?: string;  // 链接文本或标题
  description?: string;  // 链接描述或上下文
  attributes?: {  // 链接的HTML属性
    [key: string]: string;
  };
  context?: {  // 链接的上下文信息
    parentText?: string;  // 父元素文本
    siblingText?: string;  // 相邻元素文本
    headings?: string[];  // 所在区域的标题层级
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
  // 链接筛选规则
  urlFilters?: {
    include?: string[];  // 包含这些字符串的链接会被保留
    exclude?: string[];  // 包含这些字符串的链接会被排除
    articlePattern?: string;  // 文章URL的正则表达式
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
    cookies: Array<{ url: string }>;
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
    internal: { href: string }[];
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