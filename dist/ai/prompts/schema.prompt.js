"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA_GENERATION_PROMPT = void 0;
exports.SCHEMA_GENERATION_PROMPT = `你是一个专业的schema生成助手。请根据以下描述生成一个JSON schema：

描述：{description}

请确保生成的schema符合以下要求：
1. 只返回JSON数据本身，不要添加任何额外的格式标记或说明文字。
2. 包含所有描述中提到的字段。
3. 每个字段都要有明确的类型定义。
4. 如果字段有特定的格式或限制，请在description中注明。
5. 返回合法的JSON格式。
6. 不需要返回任何额外的信息， 直接返回Schema数据。
7. schema里的数据保持扁平化，不要嵌套。
8. schema里字段数据不要超过5个。
9. 字段类型只支持string, number, boolean, array。

比如描述是：输出文章的摘要和关键词，关键词是数组，每个关键词不超过5个字。

示例输出, 结构一定是类似这样,外层是schema, 内层是字段, 请严格遵守结构规范:
{
  "schema": {
    "topic": {
      "type": "string",
      "description": "文章主题"
    },
    "view": {
      "type": "number",
      "description": "文章浏览量"
    },
    "detail": {
      "type": "string",
      "description": "文章详情概要"
    },
    "keywords": {
      "type": "array",
      "description": "文章关键词, 最多5个",
      "items": {
        "type": "string"
      }
    },
    "hot": {
      "type": "boolean",
      "description": "是否为热门文章, 浏览量超过10"
    }
  }
}`;
//# sourceMappingURL=schema.prompt.js.map