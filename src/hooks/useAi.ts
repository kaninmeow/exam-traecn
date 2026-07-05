import { useState, useCallback } from 'react';
import { chatCompletion, buildMessages } from '@/api/ai';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePdfStore } from '@/stores/pdfStore';
import {
  SUMMARY_SYSTEM_PROMPT,
  buildSummaryPrompt,
  GENERATE_QUESTIONS_SYSTEM_PROMPT,
  buildGenerateQuestionsPrompt,
  CHAT_SYSTEM_PROMPT,
  buildChatPrompt,
  MIND_MAP_SYSTEM_PROMPT,
  buildMindMapPrompt,
} from '@/api/prompts';
import type { ChatMessage } from '@/types/api';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage } from '@/utils/storage';

export function useAi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettingsStore();

  const callAi = useCallback(
    async (messages: ChatMessage[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await chatCompletion(
          settings.apiBaseUrl,
          settings.apiKey,
          settings.model,
          messages
        );
        return result;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'AI 请求失败';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [settings]
  );

  const generateSummary = useCallback(
    async (pdfId: string) => {
      const text = getFromStorage<string>(STORAGE_KEYS.PDF_TEXT + pdfId, '');
      if (!text) return null;
      const messages = buildMessages(SUMMARY_SYSTEM_PROMPT, buildSummaryPrompt(text));
      return callAi(messages);
    },
    [callAi]
  );

  const generateMindMap = useCallback(
    async (pdfId: string) => {
      const text = getFromStorage<string>(STORAGE_KEYS.PDF_TEXT + pdfId, '');
      if (!text) return null;
      const messages = buildMessages(MIND_MAP_SYSTEM_PROMPT, buildMindMapPrompt(text));
      return callAi(messages);
    },
    [callAi]
  );

  const generateQuestions = useCallback(
    async (pdfId: string, types: string[], count: number) => {
      const text = getFromStorage<string>(STORAGE_KEYS.PDF_TEXT + pdfId, '');
      if (!text) return null;
      const messages = buildMessages(
        GENERATE_QUESTIONS_SYSTEM_PROMPT,
        buildGenerateQuestionsPrompt(text, types, count)
      );
      return callAi(messages);
    },
    [callAi]
  );

  const askQuestion = useCallback(
    async (pdfId: string, question: string, history: ChatMessage[] = []) => {
      const text = getFromStorage<string>(STORAGE_KEYS.PDF_TEXT + pdfId, '');
      const messages = buildMessages(CHAT_SYSTEM_PROMPT, buildChatPrompt(text, question), history);
      return callAi(messages);
    },
    [callAi]
  );

  const reExplain = useCallback(
    async (questionText: string, answer: string, explanation: string) => {
      const messages = buildMessages(
        '你是一位耐心的教师，请用不同角度重新解释这道题，使用 Markdown 格式。',
        `题目：${questionText}\n正确答案：${answer}\n原始解析：${explanation}\n\n请用更通俗易懂的方式重新解释。`
      );
      return callAi(messages);
    },
    [callAi]
  );

  return { loading, error, generateSummary, generateMindMap, generateQuestions, askQuestion, reExplain, callAi };
}
