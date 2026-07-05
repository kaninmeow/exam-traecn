import { useState, useCallback, useEffect, useRef } from 'react';
import type { Question } from '@/types/question';
import type { PracticeMode } from '@/constants';
import { useQuestionStore } from '@/stores/questionStore';
import { useStudyStore } from '@/stores/studyStore';

export function usePractice(pdfId: string, mode: PracticeMode) {
  const { getQuestions, getWrongQuestions, getFavoriteQuestions, addAnswerRecord } = useQuestionStore();
  const { recordAnswer, updateStudyTime } = useStudyStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const startTimeRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    let qs: Question[] = [];
    switch (mode) {
      case 'sequential':
        qs = getQuestions(pdfId);
        break;
      case 'random':
        qs = [...getQuestions(pdfId)].sort(() => Math.random() - 0.5);
        break;
      case 'wrong':
        qs = getWrongQuestions().filter((q) => q.pdfId === pdfId);
        break;
      case 'favorite':
        qs = getFavoriteQuestions().filter((q) => q.pdfId === pdfId);
        break;
      case 'chapter':
        qs = getQuestions(pdfId);
        break;
      default:
        qs = getQuestions(pdfId);
    }
    setQuestions(qs);
    setCurrentIndex(0);
    setUserAnswer('');
    setAnswered(false);
    setCorrectCount(0);
    startTimeRef.current = Date.now();
    sessionStartRef.current = Date.now();
  }, [pdfId, mode, getQuestions, getWrongQuestions, getFavoriteQuestions]);

  useEffect(() => {
    return () => {
      const sessionTime = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (sessionTime > 5) {
        updateStudyTime(sessionTime);
      }
    };
  }, [updateStudyTime]);

  const currentQuestion = questions[currentIndex] || null;

  const checkAnswer = useCallback(() => {
    if (!currentQuestion || answered) return;
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let isCorrect = false;

    if (currentQuestion.type === 'multiple') {
      const userArr = Array.isArray(userAnswer) ? userAnswer.sort() : [userAnswer].sort();
      const correctArr = Array.isArray(currentQuestion.answer)
        ? currentQuestion.answer.sort()
        : [currentQuestion.answer].sort();
      isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
    } else {
      const ua = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
      const ca = Array.isArray(currentQuestion.answer) ? currentQuestion.answer[0] : currentQuestion.answer;
      isCorrect = ua?.toString().trim().toLowerCase() === ca?.toString().trim().toLowerCase();
    }

    if (isCorrect) setCorrectCount((c) => c + 1);

    addAnswerRecord({
      questionId: currentQuestion.id,
      pdfId: currentQuestion.pdfId,
      userAnswer,
      isCorrect,
      answeredAt: Date.now(),
      timeSpent,
    });
    recordAnswer(isCorrect);
    setAnswered(true);
  }, [currentQuestion, answered, userAnswer, addAnswerRecord, recordAnswer]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
      setAnswered(false);
      startTimeRef.current = Date.now();
    }
  }, [currentIndex, questions.length]);

  const selectChapter = useCallback(
    (chapter: string) => {
      const allQs = getQuestions(pdfId);
      const filtered = chapter === 'all' ? allQs : allQs.filter((q) => q.chapter === chapter);
      setQuestions(filtered);
      setCurrentIndex(0);
      setUserAnswer('');
      setAnswered(false);
    },
    [pdfId, getQuestions]
  );

  return {
    questions,
    currentIndex,
    currentQuestion,
    userAnswer,
    setUserAnswer,
    answered,
    correctCount,
    checkAnswer,
    nextQuestion,
    selectChapter,
    totalQuestions: questions.length,
    isLast: currentIndex >= questions.length - 1,
  };
}
