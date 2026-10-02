import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgressItem, QuizResult, MockInterviewSession } from '../types';

interface ProgressContextType {
  progressMap: Record<string, UserProgressItem>;
  quizResults: QuizResult[];
  mockSessions: MockInterviewSession[];
  toggleBookmark: (questionId: string) => void;
  toggleMastered: (questionId: string) => void;
  markNeedsRevision: (questionId: string, days?: number) => void;
  removeRevision: (questionId: string) => void;
  saveQuizResult: (result: QuizResult) => void;
  saveMockSession: (session: MockInterviewSession) => void;
  submitContentFeedback: (questionId: string, feedback: { rating: 'helpful' | 'unhelpful'; comment?: string }) => void;
  contentFeedback: Record<string, { rating: string; comment?: string; submittedAt: string }>;
  isBookmarked: (questionId: string) => boolean;
  isMastered: (questionId: string) => boolean;
  isNeedsRevision: (questionId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const STORAGE_KEY_PROGRESS = 'devpath_progress_map';
const STORAGE_KEY_QUIZZES = 'devpath_quiz_results';
const STORAGE_KEY_MOCK = 'devpath_mock_sessions';
const STORAGE_KEY_FEEDBACK = 'devpath_content_feedback';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressMap, setProgressMap] = useState<Record<string, UserProgressItem>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Seed initial progress for demo
    return {
      'q-py-gil-01': {
        questionId: 'q-py-gil-01',
        status: 'mastered',
        bookmarked: true,
        needsRevision: false,
        confidenceScore: 5,
        lastAttemptedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      'q-dsa-sliding-01': {
        questionId: 'q-dsa-sliding-01',
        status: 'in_progress',
        bookmarked: false,
        needsRevision: true,
        revisionDueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        confidenceScore: 3,
        lastAttemptedAt: new Date().toISOString(),
      },
    };
  });

  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_QUIZZES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        quizId: 'seed-quiz-1',
        topicName: 'Sliding Window & Two Pointers',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        timeSpentSeconds: 195,
        answers: [],
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        quizId: 'seed-quiz-2',
        topicName: 'CPython GIL & Memory Model',
        score: 5,
        totalQuestions: 5,
        percentage: 100,
        timeSpentSeconds: 150,
        answers: [],
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  });

  const [mockSessions, setMockSessions] = useState<MockInterviewSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MOCK);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [contentFeedback, setContentFeedback] = useState<Record<string, { rating: string; comment?: string; submittedAt: string }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressMap));
  }, [progressMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizResults));
  }, [quizResults]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MOCK, JSON.stringify(mockSessions));
  }, [mockSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(contentFeedback));
  }, [contentFeedback]);

  const toggleBookmark = (questionId: string) => {
    setProgressMap((prev) => {
      const current = prev[questionId] || {
        questionId,
        status: 'not_started',
        bookmarked: false,
        needsRevision: false,
      };
      return {
        ...prev,
        [questionId]: {
          ...current,
          bookmarked: !current.bookmarked,
        },
      };
    });
  };

  const toggleMastered = (questionId: string) => {
    setProgressMap((prev) => {
      const current = prev[questionId] || {
        questionId,
        status: 'not_started',
        bookmarked: false,
        needsRevision: false,
      };
      const isNowMastered = current.status !== 'mastered';
      return {
        ...prev,
        [questionId]: {
          ...current,
          status: isNowMastered ? 'mastered' : 'in_progress',
          lastAttemptedAt: new Date().toISOString(),
        },
      };
    });
  };

  const markNeedsRevision = (questionId: string, days = 3) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    setProgressMap((prev) => {
      const current = prev[questionId] || {
        questionId,
        status: 'not_started',
        bookmarked: false,
        needsRevision: false,
      };
      return {
        ...prev,
        [questionId]: {
          ...current,
          needsRevision: true,
          revisionDueDate: dueDate.toISOString(),
        },
      };
    });
  };

  const removeRevision = (questionId: string) => {
    setProgressMap((prev) => {
      if (!prev[questionId]) return prev;
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          needsRevision: false,
          revisionDueDate: undefined,
        },
      };
    });
  };

  const saveQuizResult = (result: QuizResult) => {
    setQuizResults((prev) => [result, ...prev]);
  };

  const saveMockSession = (session: MockInterviewSession) => {
    setMockSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
  };

  const submitContentFeedback = (questionId: string, feedback: { rating: 'helpful' | 'unhelpful'; comment?: string }) => {
    setContentFeedback((prev) => ({
      ...prev,
      [questionId]: {
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: new Date().toISOString(),
      },
    }));
  };

  const isBookmarked = (id: string) => !!progressMap[id]?.bookmarked;
  const isMastered = (id: string) => progressMap[id]?.status === 'mastered';
  const isNeedsRevision = (id: string) => !!progressMap[id]?.needsRevision;

  return (
    <ProgressContext.Provider
      value={{
        progressMap,
        quizResults,
        mockSessions,
        toggleBookmark,
        toggleMastered,
        markNeedsRevision,
        removeRevision,
        saveQuizResult,
        saveMockSession,
        submitContentFeedback,
        contentFeedback,
        isBookmarked,
        isMastered,
        isNeedsRevision,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
};
