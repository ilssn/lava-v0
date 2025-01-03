export interface FocusPoint {
  id: string;
  focuspoint: string;
  explanation?: string;
}

export interface CrawlerTask {
  url: string;
  recursiveConfig?: {
    maxDepth: number;
    maxUrls?: number;
    urlPattern?: string;
    excludePattern?: string;
  };
  focusPoints?: FocusPoint[];
}

export interface ExtractedInfo {
  url: string;
  author: string;
  publishDate: string;
  screenshot: string;
  items: Array<{
    tag: string;
    content: string;
  }>;
  relatedUrls: string[];
  depth?: number;
}

export interface CrawlerResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  results?: ExtractedInfo[];
} 