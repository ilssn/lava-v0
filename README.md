# Web Crawler Service

基于 NestJS 和 Crawlee 的网页爬虫服务，支持智能内容提取和递归爬取。

## 功能特点

- 基于 PlaywrightCrawler 的高性能网页爬取
- 支持递归爬取和链接过滤
- 使用 LangChain 和 OpenAI 进行智能内容分析
- 支持自定义焦点提取
- RESTful API 接口

## 环境要求

- Node.js >= 16
- npm >= 7

## 安装

```bash
# 安装依赖
npm install
```

## 配置

在项目根目录创建 `.env` 文件并配置以下环境变量：

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1  # OpenAI API 基础URL，可选，默认为官方API地址
OPENAI_MODEL=gpt-3.5-turbo-16k
OPENAI_SECONDARY_MODEL=gpt-3.5-turbo
CRAWLER_HEADLESS=true
MAX_REQUEST_RETRIES=2
REQUEST_HANDLER_TIMEOUT=300000
STORAGE_DIR=./storage
```

## 运行

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

## API 使用

### 创建爬取任务

```bash
curl -X POST http://localhost:3000/crawler/task \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "recursiveConfig": {
    "maxDepth": 2,
    "maxUrls": 100,
    "urlPattern": "example\\.com"
  },
  "focusPoints": [
    {
      "id": "title",
      "focuspoint": "标题",
      "explanation": "文章的主标题"
    },
    {
      "id": "content",
      "focuspoint": "正文",
      "explanation": "文章的主要内容"
    }
  ]
}'
```

### 查询任务状态

```bash
curl http://localhost:3000/crawler/task/{taskId}
```

## 项目结构

```
crawler-service/
├── src/
│ ├── crawler/
│ │ ├── crawler.service.ts    # 爬虫核心服务
│ │ ├── crawler.controller.ts # API 控制器
│ │ ├── crawler.module.ts     # 模块定义
│ │ └── interfaces/
│ │   └── crawler.interface.ts # 类型定义
│ ├── ai/
│ │ ├── extractor.service.ts  # AI 提取服务
│ │ └── prompts/
│ │   └── extract.prompt.ts   # AI 提示词模板
│ ├── config/
│ │ └── configuration.ts      # 配置文件
│ └── app.module.ts
├── .env                      # 环境变量
└── package.json
```

## 开发

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test
```

## 部署

```bash
docker-compose up -d
docker-compose down
docker-compose restart
```

## 注意事项

1. 请确保配置了正确的 OpenAI API Key
2. 爬取时请遵守目标网站的 robots.txt 规则
3. 建议配置适当的请求间隔和并发数
4. 对于大规模爬取，请注意磁盘存储空间

## License

MIT 