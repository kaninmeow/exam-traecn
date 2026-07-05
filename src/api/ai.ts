import axios from 'axios';
import type { ChatMessage, ChatCompletionResponse } from '@/types/api';

export async function chatCompletion(
  apiBaseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature = 0.7,
  maxTokens = 4096
): Promise<string> {
  if (!apiKey) {
    throw new Error('请先在设置页面配置 API Key');
  }

  try {
    const response = await axios.post<ChatCompletionResponse>(
      `${apiBaseUrl}/chat/completions`,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60000,
      }
    );

    return response.data.choices[0]?.message?.content || '';
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('API Key 无效，请检查设置');
      }
      if (error.response?.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      throw new Error(error.response?.data?.error?.message || 'AI 请求失败');
    }
    throw error;
  }
}

export function buildMessages(
  systemPrompt: string,
  userPrompt: string,
  history: ChatMessage[] = []
): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];
  messages.push(...history);
  messages.push({ role: 'user', content: userPrompt });
  return messages;
}