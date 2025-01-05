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

export interface CrawlerTask {
  url: string;
  recursiveConfig?: {
    maxDepth: number;
    maxUrls?: number;
    urlPattern?: string;
    excludePattern?: string;
  };
  schema?: Schema;
}

export interface ExtractedInfo {
  url: string;
  author: string;
  publishDate: string;
  screenshot: string;
  data: any;
  relatedUrls: string[];
  depth?: number;
}

export interface CrawlerResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  results?: ExtractedInfo[];
} 