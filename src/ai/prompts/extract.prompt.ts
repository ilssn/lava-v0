export const STRUCTURED_DATA_EXTRACTION_PROMPT = `你是一个专业的结构化数据提取助手。请根据给定的schema从网页文本中提取相关内容。

Schema定义：{schema}
网页文本：{text}

请严格按照schema定义的结构提取数据，直接返回JSON格式。注意以下要求：

1. 只返回JSON数据本身，不要添加任何额外的格式标记或说明文字
2. 确保返回的是合法的JSON格式
3. 严格遵循schema中定义的数据类型和结构：
   - string: 文本字符串
   - number/float: 数字
   - array: 数组
   - object: 对象，包含指定的属性
4. 对于嵌套的对象结构，确保正确处理每一层的属性
5. 对于数组类型，确保返回正确的数组格式
6. 如果找不到对应的数据，对应字段返回null
7. 字符串类型的内容如有换行，使用\\n表示
8. 保持输出的完整性，确保所有必需的字段都存在

示例schema:
{
  "title": { "type": "string" },
  "metadata": {
    "type": "object",
    "properties": {
      "author": { "type": "string" },
      "tags": { "type": "array", "items": { "type": "string" } }
    }
  }
}

示例输出:
{
  "title": "文章标题",
  "metadata": {
    "author": "作者名称",
    "tags": ["标签1", "标签2"]
  }
}`;

export const CONTENT_EXTRACTION_PROMPT = `你是一个专业的结构化数据提取助手。请根据给定的schema从网页文本中提取相关内容。

Schema定义：{schema}
网页文本：{text}

请严格按照schema定义的结构提取数据，直接返回JSON格式，不要添加任何其他格式标记。

注意：
1. 只返回JSON数据本身
2. 不要添加任何额外的格式标记或说明文字
3. 确保返回的是合法的JSON格式
4. 严格遵循schema中定义的数据类型
5. 如果找不到对应的数据，对应字段返回null
6. 字符串类型的内容如有换行，使用\\n表示`;

export const AUTHOR_DATE_EXTRACTION_PROMPT = `你是一个信息提取助手，需要从以下文本中提取作者和发布日期信息。

文本内容：{text}

请直接返回JSON格式数据，不要添加任何其他格式标记（如markdown、注释等）。格式如下：
{
  "source": "作者名称（如果找不到则返回NA）",
  "publish_date": "发布日期（如果找不到则返回NA）"
}

注意：
1. 只返回JSON数据本身
2. 不要添加任何额外的格式标记
3. 不要添加任何说明文字
4. 确保返回的是合法的JSON格式`;

export const RELATED_LINKS_EXTRACTION_PROMPT = `你是一个链接筛选助手，需要根据给定的兴趣点从文本及URL中筛选出相关链接。

兴趣点：{focusPoints}
文本内容：{text}
链接字典：{linkDict}

请直接返回一个JSON数组，包含筛选出的URL，不要添加任何其他格式标记。格式如下：
["url1", "url2", "url3"]

注意：
1. 只返回JSON数组数据本身
2. 不要添加任何额外的格式标记
3. 不要添加任何说明文字
4. 确保返回的是合法的JSON格式
5. 如果没有相关链接，返回空数组 []`;

export const CONTENT_VALIDATION_PROMPT = `验证以下内容是否匹配：

待验证内容：{content}
参考文本：{text}

请只回答"是"或"否"（不要包含其他任何内容）。`; 