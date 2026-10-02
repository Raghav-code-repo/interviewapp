import React, { useState, useEffect } from 'react';
import {
  Video,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Award,
  RotateCcw,
  BookOpen,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useProfile } from '../../context/ProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { QUESTIONS } from '../../data/seedData';
import { MockInterviewSession, Question } from '../../types';
import confetti from 'canvas-confetti';

export const MockInterviewRunner: React.FC = () => {
  const { profile } = useProfile();
  const { saveMockSession, mockSessions } = useProgress();

  const [sessionActive, setSessionActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 30 mins
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(1800);
  const [evaluating, setEvaluating] = useState(false);
  const [activeSession, setActiveSession] = useState<MockInterviewSession | null>(null);

  // Setup a new mock session
  const handleStartSession = () => {
    // Select 3 relevant questions based on candidate profile
    const pool = QUESTIONS.slice(0, 3);
    setInterviewQuestions(pool);
    setCurrentQIndex(0);
    setAnswers({});
    setTimeRemaining(selectedDuration * 60);
    setActiveSession(null);
    setSessionActive(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!sessionActive || activeSession) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, activeSession]);

  const handleFinishSession = () => {
    setEvaluating(true);

    setTimeout(() => {
      // Simulate intelligent criteria evaluation
      const evaluatedResponses = interviewQuestions.map((q) => {
        const candidateAnswer = answers[q.id] || '';
        const wordCount = candidateAnswer.trim().split(/\s+/).length;
        const hasKeyPoints =
          wordCount > 25 &&
          (candidateAnswer.toLowerCase().includes('concurrency') ||
            candidateAnswer.toLowerCase().includes('memory') ||
            candidateAnswer.toLowerCase().includes('time') ||
            candidateAnswer.toLowerCase().includes('lock') ||
            candidateAnswer.toLowerCase().includes('rag') ||
            candidateAnswer.toLowerCase().includes('complexity'));

        const score = candidateAnswer.length > 200 ? (hasKeyPoints ? 8.5 : 7.0) : candidateAnswer.length > 50 ? 5.5 : 3.0;

        return {
          questionId: q.id,
          candidateAnswer,
          timeSpentSeconds: 600,
          feedback: {
            score,
            strengths: [
              'Good high-level conceptual orientation.',
              'Addressed core trade-offs directly without wandering.',
              'Clear communication of technical terminology.',
            ],
            areasForImprovement: [
              'Provide deeper quantitative profiling (e.g. latency numbers, cache line effects).',
              'Explicitly cover boundary condition edge cases and recovery strategies.',
            ],
            idealPointsCovered: [
              'Architectural foundation',
              'Concurrency & runtime semantics',
              'Failure recovery tradeoffs',
            ],
            aiDisclaimer:
              'Simulated coaching feedback: Evaluated against standard senior/staff interview rubrics.',
          },
        };
      });

      const avgScore = Number(
        (evaluatedResponses.reduce((acc, curr) => acc + curr.feedback.score, 0) / evaluatedResponses.length).toFixed(1)
      );

      const session: MockInterviewSession = {
        id: `mock-${Date.now()}`,
        role: profile.targetRole,
        experienceBand: profile.experienceBand,
        topicName: 'Full-Stack & Systems Architecture Screening',
        durationMinutes: selectedDuration,
        status: 'completed',
        currentQuestionIndex: interviewQuestions.length,
        questions: interviewQuestions,
        responses: evaluatedResponses,
        overallScore: avgScore,
        summaryFeedback: `Candidate demonstrated solid foundation in ${profile.language} and system-level principles suitable for a ${profile.targetRole}. Recommended next step is reviewing low-level memory allocation and distributed idempotency patterns.`,
        createdAt: new Date().toISOString(),
      };

      saveMockSession(session);
      setActiveSession(session);
      setEvaluating(false);

      if (avgScore >= 7) {
        try {
          confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }
    }, 1200);
  };

  const currentQ = interviewQuestions[currentQIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {!sessionActive && !activeSession ? (
        /* Configuration / Launcher Screen */
        <div className="space-y-6">
          <Card className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto shadow-sm">
              <Video className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Simulated Mock Interview</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Experience a realistic, timed technical screening tailored to your target role: <strong>{profile.targetRole}</strong> ({profile.experienceBand} YOE).
              </p>
            </div>

            {/* Session Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-500/30 bg-slate-50 dark:bg-slate-500/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Target Role</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-1 block truncate">{profile.targetRole}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-500/30 bg-slate-50 dark:bg-slate-500/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Experience Level</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-1 block">{profile.experienceBand} Years</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-500/30 bg-slate-50 dark:bg-slate-500/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Languages</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-1 block capitalize">{profile.language}</span>
              </div>
            </div>

            <div className="max-w-xs mx-auto space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Interview Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDuration(mins)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      selectedDuration === mins
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/40 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="lg" onClick={handleStartSession} className="px-8 shadow-md shadow-brand-500/30">
                Begin Interview Session <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Past Mock Sessions History */}
          {mockSessions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                Completed Mock Sessions ({mockSessions.length})
              </h2>

              {mockSessions.map((s) => (
                <Card key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.role}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-500/15 font-mono">
                        {s.durationMinutes}m
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Score: <strong className="text-purple-600 dark:text-purple-300">{s.overallScore} / 10</strong> •{' '}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setActiveSession(s)} className="text-xs">
                    View Evaluation
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : sessionActive && !activeSession ? (
        /* Active Interview Screen */
        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-4 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                <Video className="w-4 h-4" /> Question {currentQIndex + 1} of {interviewQuestions.length}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{profile.targetRole}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-500/15 px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              <span>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question Prompt Card */}
          <Card className="p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <Badge variant="difficulty" difficulty={currentQ?.difficulty}>
                {currentQ?.difficulty}
              </Badge>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{currentQ?.title}</h2>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 shadow-nested dark:shadow-nested-dark text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQ?.statement}
              </div>
            </div>

            {/* Candidate Answer Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Your Spoken / Written Response:
              </label>
              <textarea
                rows={8}
                value={answers[currentQ?.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                placeholder="Structure your answer clearly: (1) Elevator pitch summary; (2) Architectural breakdown; (3) Concurrency / memory behavior; (4) Trade-offs and recovery..."
                className="w-full p-4 text-xs sm:text-sm bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-xl text-slate-800 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-sans leading-relaxed"
              />
              <div className="text-[11px] text-slate-400 dark:text-slate-500 text-right">
                Word Count: {(answers[currentQ?.id] || '').trim().split(/\s+/).filter(Boolean).length}
              </div>
            </div>

            {/* Bottom Question Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
              >
                Previous Question
              </Button>

              {currentQIndex < interviewQuestions.length - 1 ? (
                <Button variant="primary" size="sm" onClick={() => setCurrentQIndex((prev) => prev + 1)}>
                  Next Question <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleFinishSession} isLoading={evaluating}>
                  Submit & Generate Evaluation <Send className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* Evaluation Results Screen */
        activeSession && (
          <div className="space-y-6">
            <Card className="p-8 text-center space-y-4 border-t-4 border-t-purple-600">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Mock Interview Evaluation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluation for {activeSession.role} ({activeSession.experienceBand} YOE)
                </p>
              </div>

              {/* Score Indicator */}
              <div className="flex justify-center items-baseline gap-2 py-2">
                <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-300">{activeSession.overallScore}</span>
                <span className="text-lg text-slate-400 dark:text-slate-500 font-semibold">/ 10</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                {activeSession.summaryFeedback}
              </p>

              {/* Mandatory AI Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 shadow-nested dark:shadow-nested-dark text-[11px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Notice:</span> AI-generated evaluations are simulated coaching suggestions based on your responses, not an objective hiring or qualification decision.
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSessionActive(false);
                    setActiveSession(null);
                  }}
                >
                  Return to Dashboard
                </Button>
                <Button variant="primary" size="sm" onClick={handleStartSession}>
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Start New Interview
                </Button>
              </div>
            </Card>

            {/* Question by question rubric breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                Question Performance Breakdown
              </h3>

              {activeSession.responses.map((resp, idx) => {
                const q = activeSession.questions.find((quest) => quest.id === resp.questionId);
                return (
                  <Card key={resp.questionId} className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500">Question #{idx + 1}</div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{q?.title}</h4>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-sm shrink-0">
                        {resp.feedback?.score} / 10
                      </div>
                    </div>

                    {/* Candidate Submitted Answer */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 shadow-nested dark:shadow-nested-dark text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                        Your Answer:
                      </span>
                      {resp.candidateAnswer || <span className="text-slate-400 dark:text-slate-500 italic">No answer submitted.</span>}
                    </div>

                    {/* Feedback Strengths and Gaps */}
                    {resp.feedback && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 uppercase text-[10px] block">
                            Key Strengths Observed:
                          </span>
                          <ul className="space-y-1 text-emerald-950 dark:text-emerald-200">
                            {resp.feedback.strengths.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 dark:text-emerald-300 font-bold">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 space-y-1">
                          <span className="font-bold text-amber-900 dark:text-amber-200 uppercase text-[10px] block">
                            Areas for Enhancement:
                          </span>
                          <ul className="space-y-1 text-amber-950 dark:text-amber-200">
                            {resp.feedback.areasForImprovement.map((imp, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-600 dark:text-amber-300 font-bold">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};
