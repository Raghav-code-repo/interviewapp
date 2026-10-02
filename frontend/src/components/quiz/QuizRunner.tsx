import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Award,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QUIZ_QUESTIONS, TOPICS } from '../../data/seedData';
import { QuizQuestion, QuizResult } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import confetti from 'canvas-confetti';

export const QuizRunner: React.FC = () => {
  const { saveQuizResult } = useProgress();

  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 mins
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);

  // Start Quiz setup
  const handleStart = () => {
    const list =
      selectedTopicId === 'all'
        ? [...QUIZ_QUESTIONS]
        : QUIZ_QUESTIONS.filter((q) => q.topicId === selectedTopicId);
    // Shuffle
    const shuffled = list.sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setTimeRemaining(shuffled.length * 60); // 1 min per question
    setQuizFinished(false);
    setQuizStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || quizFinished) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStarted, quizFinished]);

  const handleSelectAnswer = (optionIdx: number) => {
    if (quizFinished) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const result: QuizResult = {
      quizId: `quiz-${Date.now()}`,
      topicName:
        selectedTopicId === 'all'
          ? 'Comprehensive CS Diagnostic'
          : TOPICS.find((t) => t.id === selectedTopicId)?.name || 'Custom Quiz',
      score: correct,
      totalQuestions: activeQuestions.length,
      percentage: Math.round((correct / activeQuestions.length) * 100),
      timeSpentSeconds: activeQuestions.length * 60 - timeRemaining,
      answers: activeQuestions.map((q, idx) => ({
        questionId: q.id,
        userAnswerIndex: selectedAnswers[idx] ?? -1,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect: selectedAnswers[idx] === q.correctAnswerIndex,
      })),
      completedAt: new Date().toISOString(),
    };

    saveQuizResult(result);

    if (result.percentage >= 70) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const currentQ = activeQuestions[currentIdx];

  // Calculate score when finished
  const correctCount = activeQuestions.filter(
    (q, idx) => selectedAnswers[idx] === q.correctAnswerIndex
  ).length;
  const scorePercent = activeQuestions.length
    ? Math.round((correctCount / activeQuestions.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Quiz Launcher Screen */}
      {!quizStarted ? (
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center mx-auto shadow-sm">
            <HelpCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Technical Diagnostic & Quizzes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Test your mastery with conceptual, true/false, and code snippet output questions across CPython GIL, JVM internals, DSA, Systems, and Generative AI.
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Select Topic Scope</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-500/10 border border-slate-300 dark:border-slate-500/40 rounded-lg text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Topics (Full Diagnostic)</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button variant="primary" size="lg" onClick={handleStart} className="px-8 shadow-md shadow-brand-500/30">
              Start Timed Quiz <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      ) : !quizFinished ? (
        /* Quiz Active In-Progress Screen */
        <div className="space-y-6">
          {/* Top Progress & Timer Bar */}
          <div className="p-4 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Question {currentIdx + 1} of {activeQuestions.length}
              </span>
              <span className="text-slate-300">|</span>
              <Badge variant="difficulty" difficulty={currentQ?.difficulty || 'intermediate'}>
                {currentQ?.difficulty}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-500/15 px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-300" />
              <span>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {currentQ.question}
              </h2>

              {/* Code snippet if code_output question */}
              {currentQ.codeSnippet && (
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 dark:border-slate-700">
                  <code>{currentQ.codeSnippet.code}</code>
                </pre>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectAnswer(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/10 text-brand-950 dark:text-brand-200 font-medium ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10 hover:border-slate-300 hover:dark:border-slate-500/40'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </Button>

              {currentIdx < activeQuestions.length - 1 ? (
                <Button variant="primary" size="sm" onClick={() => setCurrentIdx((prev) => prev + 1)}>
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleFinishQuiz}>
                  Submit Quiz <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* Quiz Completed & Detailed Answer Review */
        <div className="space-y-6">
          <Card className="p-8 text-center space-y-4 border-t-4 border-t-brand-600">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                scorePercent >= 70 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300'
              }`}
            >
              {scorePercent >= 70 ? <Award className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Quiz Completed!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Here is your comprehensive evaluation:</p>
            </div>

            <div className="flex justify-center gap-6 py-2">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-300">{scorePercent}%</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-300">
                  {correctCount} / {activeQuestions.length}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Correct Answers</div>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setQuizStarted(false)}>
                Back to Quizzes
              </Button>
              <Button variant="primary" size="sm" onClick={handleStart}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Quiz
              </Button>
            </div>
          </Card>

          {/* Questions Review Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
              Detailed Answer Key & Explanations
            </h3>

            {activeQuestions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctAnswerIndex;

              return (
                <Card key={q.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-400 dark:text-slate-500">Q{idx + 1}.</span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{q.question}</span>
                    </div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  {q.codeSnippet && (
                    <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto">
                      <code>{q.codeSnippet.code}</code>
                    </pre>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[10px] uppercase">Your Answer:</span>
                      <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-red-700 dark:text-red-300 font-bold'}>
                        {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200">
                      <span className="text-emerald-800 dark:text-emerald-300 font-semibold block text-[10px] uppercase">
                        Correct Answer:
                      </span>
                      <span className="font-bold">{q.options[q.correctAnswerIndex]}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-500/10 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Explanation: </span>
                    {q.explanation}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
