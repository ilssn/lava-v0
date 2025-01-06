export const SCHEMA_GENERATION_PROMPT = `你是一个专业的schema生成助手。请根据以下描述生成一个JSON schema：

描述：{description}

请确保生成的schema符合以下要求：
1. 只返回JSON数据本身，不要添加任何额外的格式标记或说明文字。
2. 包含所有描述中提到的字段。
3. 每个字段都要有明确的类型定义。
4. 如果字段有特定的格式或限制，请在description中注明。
5. 返回合法的JSON格式。
6. 不需要返回任何额外的信息， 直接返回Schema数据。

比如描述是：输出文章的摘要和关键词，关键词是数组，每个关键词不超过5个字。

示例输出:
{
  "summary": {
    "type": "string",
    "description": "概括文章内容, 建议不超过100字"
  },
  "keyword": {
    "type": "array",
    "description": "文章关键词, 每个关键词不超过5个字",
    "itemType": "string"
  },
  "metadata": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "文章标题"
      },
      "author": {
        "type": "string",
        "description": "文章作者"
      },
      "date": {
        "type": "string",
        "description": "文章发布日期, 格式为YYYY-MM-DD"
      },
      "views": {
        "type": "number",
        "description": "文章阅读量"
      },
      "tags": {
        "type": "array",
        "itemType": "string",
        "description": "文章标签, 每个标签不超过5个字"
      }
    }
  }
}`; 