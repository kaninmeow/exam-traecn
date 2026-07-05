export const SUMMARY_SYSTEM_PROMPT = `你是一位专业的教育助手，擅长分析教材和题库内容，提炼考试重点。
请用中文回答，输出格式使用 Markdown。`;

export function buildSummaryPrompt(textContent: string): string {
  return `请分析以下 PDF 文档内容，生成考试重点总结。请按以下格式输出：

## 高频考点
- 列出最重要的考点

## 必背知识点
- 列出需要记忆的核心知识点

## 核心概念
- 列出并简要解释核心概念

## 易错点
- 列出容易犯错的地方

## 思维导图
用 Markdown 缩进列表格式展示知识结构

## 章节总结
按章节分别总结要点

文档内容：
${textContent.slice(0, 8000)}`;
}

export const GENERATE_QUESTIONS_SYSTEM_PROMPT = `你是一位专业的出题教师，擅长根据教材内容出题。
请严格按照 JSON 格式输出题目数组，不要输出其他内容。
每道题包含：type(题目类型), question(题目), options(选项数组，选择题需要), answer(正确答案), explanation(解析), chapter(所属章节)。
type 取值：single(单选), multiple(多选), judge(判断), fill(填空), short(简答)。
判断题 answer 为 "正确" 或 "错误"。
多选题 answer 为字母数组如 ["A","B","C"]。
单选题 answer 为单个字母如 "A"。
填空题和简答题 answer 为文本。
options 仅在单选和多选题中提供，格式为 ["A. xxx", "B. xxx", ...]。`;

export function buildGenerateQuestionsPrompt(
  textContent: string,
  types: string[],
  count: number
): string {
  return `请根据以下文档内容生成 ${count} 道题目。
要求题型：${types.join('、')}
要求：
1. 题目内容基于文档
2. 每道题必须有解析
3. 标注所属章节
4. 输出为 JSON 数组格式

文档内容：
${textContent.slice(0, 8000)}`;
}

export const CHAT_SYSTEM_PROMPT = `你是一位智能学习助手，基于用户上传的 PDF 文档内容回答问题。
请用中文回答，语言简洁明了，必要时使用 Markdown 格式。`;

export function buildChatPrompt(pdfText: string, question: string): string {
  return `参考文档内容：
${pdfText.slice(0, 6000)}

用户问题：${question}`;
}

export const RE_EXPLAIN_PROMPT = `你是一位耐心的教师，请用不同的角度和更通俗易懂的方式重新解释这道题。
使用 Markdown 格式。`;