# 我需要使用 NestJS 和 Crawlee 技术栈创建一个网页爬虫项目，具体要求如下

1. 项目结构：

crawler-service/
├── src/
│ ├── crawler/
│ │ ├── crawler.service.ts # 爬虫核心服务
│ │ ├── crawler.controller.ts # API 控制器
│ │ ├── crawler.module.ts # 模块定义
│ │ └── interfaces/
│ │ └── crawler.interface.ts # 类型定义
│ ├── ai/
│ │ ├── extractor.service.ts # AI 提取服务
│ │ └── prompts/
│ │ └── extract.prompt.ts # AI 提示词模板
│ ├── config/
│ │ └── configuration.ts # 配置文件
│ └── app.module.ts
├── .env # 环境变量
└── package.json

## 核心依赖

- @nestjs/common
- @nestjs/config
- crawlee
- playwright
- cheerio
- langchain
- openai

## 主要功能

- 提供 REST API 接口接收爬取任务
- 使用 Crawlee 的 PlaywrightCrawler 进行网页爬取
- 使用 Cheerio 解析 HTML 提取链接
- 使用 LangChain 和 OpenAI 进行内容分析
- 支持递归爬取和链接过滤
- 支持自定义焦点提取

## 关键接口定义

typescript
// 焦点点定义
interface FocusPoint {
id: string;
focuspoint: string;
explanation?: string;
}
// 爬虫任务
interface CrawlerTask {
url: string;
recursiveConfig?: {
maxDepth: number;
maxUrls?: number;
urlPattern?: string;
excludePattern?: string;
};
}
// 提取结果
interface ExtractedInfo {
url: string;
author: string;
publishDate: string;
items: Array<{
tag: string;
content: string;
}>;
relatedUrls: string[];
depth?: number;
}

## AI 提示词系统

需要实现以下三个核心提示词模板：

a) 内容提取提示词：
作为信息提取助手，你的任务是从给定的网页文本中提取与以下用户兴趣点相关的内容。兴趣点列表及其解释如下：
{focusPoints}
在进行信息提取时，请遵循以下原则：
理解每个兴趣点的含义，确保提取的内容与之相关
如果兴趣点有进一步的解释，确保提取的内容符合这些解释的范围
忠于原文，你的任务是从网页文本中识别和提取与各个兴趣点相关的信息，并不是总结和提炼
不管给定的原文是何种语言，请保证使用中文输出你的提取结果
文本内容：
{text}
请以JSON格式返回，包含以下字段：
[{"focus": "兴趣点名称", "content": "提取的内容"}]

b) 作者和日期提取提示词：
As an information extraction assistant, your task is to accurately extract the source (or author) and publication date from the given webpage text. It is important to adhere to extracting the information directly from the original text. If the original text does not contain a particular piece of information, please replace it with NA
<text>
{text}
</text>
Please output the extracted information in the following JSON format:
{"source": source or article author (use "NA" if this information cannot be extracted), "publish_date": extracted publication date (keep only the year, month, and day; use "NA" if this information cannot be extracted)}

c) 相关链接提取提示词：
作为一位高效的信息筛选助手，你的任务是根据给定的兴趣点，从给定的文本及其对应的URL中挑选出最值得关注的URL。兴趣点及其解释如下：
{focusPoints}
链接字典：
{linkDict}
请逐条分析，先逐一给出分析依据，最终将挑选出的 url 按一行一条的格式输出，最终输出的 url 列表整体用三引号包裹，三引号内不要有其他内容。
示例输出格式：
"""
https://example.com/url1
https://example.com/url2
"""

d) 内容验证提示词：
判断给定的信息是否与网页文本相符。信息将用标签<info></info>包裹，网页文本则用<text></text>包裹。请遵循如下工作流程:
1、尝试找出网页文本中所有与信息对应的文本片段（可能有多处）；
2、基于这些片段给出是否相符的最终结论，最终结论仅为"是"或"否"
<info>
{content}
</info>
<text>
{text}
</text>
先输出找到的所有文本片段，再输出最终结论（仅为是或否）

1. 环境变量配置：
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo-16k
OPENAI_SECONDARY_MODEL=gpt-3.5-turbo
CRAWLER_HEADLESS=true
MAX_REQUEST_RETRIES=2
REQUEST_HANDLER_TIMEOUT=300000
STORAGE_DIR=./storage

## API 使用示例

bash
curl -X POST http://localhost:3000/crawler/task \
-H "Content-Type: application/json" \
-d '{
"url": "https://example.com",
"recursiveConfig": {
"maxDepth": 2,
"maxUrls": 100,
"urlPattern": "example\\.com"
}
}'

请帮我实现这个项目，确保：

1. 代码跟模块遵循最佳实践
2. 实现完整的错误处理
3. 使用适当的日志记录
4. 提供必要的注释
5. 遵循 NestJS 的模块化设计原则
6. . 坚决使用NestJS 和 TypeScript 进行项目开发
7. 坚决使用Crawlee 的 PlaywrightCrawler 进行网页爬取
8. 坚决使用LangChain 和 OpenAI 进行内容分析
9. 坚决使用Cheerio 进行HTML解析
10. 代码严谨，逻辑清晰，注释完整，文档齐全，确保项目可维护性跟可读性还有拓展性
11. 确保项目可以正常运行，并且可以正常输出结果