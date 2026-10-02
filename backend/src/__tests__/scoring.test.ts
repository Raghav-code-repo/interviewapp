import { describe, it, expect } from 'vitest';

// 1. Scoring Logic Unit Tests
describe('Diagnostic Quiz Scoring & Pass Logic', () => {
  function calculateQuizScore(correctCount: number, totalQuestions: number): { score: number; percentage: number; passed: boolean } {
    if (totalQuestions === 0) return { score: 0, percentage: 0, passed: false };
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    return {
      score: correctCount,
      percentage,
      passed: percentage >= 70,
    };
  }

  it('calculates 100% when all questions are correct', () => {
    const result = calculateQuizScore(5, 5);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('calculates 80% and passes when 4 of 5 are correct', () => {
    const result = calculateQuizScore(4, 5);
    expect(result.percentage).toBe(80);
    expect(result.passed).toBe(true);
  });

  it('calculates 60% and marks failed when below 70% threshold', () => {
    const result = calculateQuizScore(3, 5);
    expect(result.percentage).toBe(60);
    expect(result.passed).toBe(false);
  });

  it('handles zero questions gracefully without divide-by-zero error', () => {
    const result = calculateQuizScore(0, 0);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });
});

// 2. Experience Adaptation Heuristics Unit Tests
describe('Experience Adaptation Engine', () => {
  interface QuestionMock {
    id: string;
    minExp: number;
    maxExp: number;
    difficulty: string;
  }

  const mockQuestions: QuestionMock[] = [
    { id: 'q-junior', minExp: 0, maxExp: 2, difficulty: 'beginner' },
    { id: 'q-mid', minExp: 2, maxExp: 5, difficulty: 'intermediate' },
    { id: 'q-senior', minExp: 5, maxExp: 10, difficulty: 'advanced' },
    { id: 'q-staff', minExp: 8, maxExp: 20, difficulty: 'expert' },
  ];

  function filterRecommendedQuestions(questions: QuestionMock[], candidateExpBand: string): QuestionMock[] {
    const minYears = parseInt(candidateExpBand.split('-')[0]) || 0;
    return questions.filter((q) => minYears >= q.minExp && minYears <= q.maxExp);
  }

  it('recommends junior and entry questions for 0-2 years candidate', () => {
    const recommended = filterRecommendedQuestions(mockQuestions, '0-2');
    expect(recommended.map((q) => q.id)).toContain('q-junior');
  });

  it('recommends intermediate and concurrency questions for 2-5 years candidate', () => {
    const recommended = filterRecommendedQuestions(mockQuestions, '2-5');
    expect(recommended.map((q) => q.id)).toContain('q-mid');
  });

  it('recommends advanced and distributed systems questions for 8-12 years candidate', () => {
    const recommended = filterRecommendedQuestions(mockQuestions, '8-12');
    expect(recommended.map((q) => q.id)).toContain('q-staff');
  });
});

// 3. Spaced Repetition Scheduling Interval Unit Tests
describe('Spaced Repetition Scheduling Engine', () => {
  function getNextIntervalDays(currentInterval: number, wasRemembered: boolean): number {
    if (!wasRemembered) return 1; // reset to 1 day on recall failure
    switch (currentInterval) {
      case 1:
        return 3;
      case 3:
        return 7;
      case 7:
        return 14;
      case 14:
        return 30;
      default:
        return currentInterval * 2;
    }
  }

  it('advances from 1 day to 3 days on successful recall', () => {
    expect(getNextIntervalDays(1, true)).toBe(3);
  });

  it('advances from 3 days to 7 days on successful recall', () => {
    expect(getNextIntervalDays(3, true)).toBe(7);
  });

  it('resets interval back to 1 day if candidate failed to recall', () => {
    expect(getNextIntervalDays(14, false)).toBe(1);
  });
});
