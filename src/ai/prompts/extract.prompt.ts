export const CONTENT_EXTRACTION_PROMPT = `你是一个专业的内容提取助手。请根据以下焦点提取网页文本中的相关内容。

焦点：{focusPoints}
网页文本：{text}

请直接返回JSON数组格式数据，不要添加任何其他格式标记（如markdown、注释等）。格式如下：
[
  {
    "focus": "焦点名称",
    "content": "提取的内容"
  }
]

注意：
1. 只返回JSON数据本身
2. 不要添加任何额外的格式标记
3. 不要添加任何说明文字
4. 确保返回的是合法的JSON格式
5. 如果没有找到相关内容，对应的content字段返回空字符串
6. 内容中如有换行，使用\\n表示`;

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