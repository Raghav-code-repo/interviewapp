import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  Terminal,
  Coffee,
  Code2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Award,
  Layers,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Modal } from '../ui/Modal';
import { QUESTIONS, CATEGORIES, TOPICS } from '../../data/seedData';
import { useProgress } from '../../context/ProgressContext';
import { useProfile } from '../../context/ProfileContext';
import { getDifficultyColor } from '../../utils/cn';

export const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const {
    progressMap,
    toggleBookmark,
    toggleMastered,
    markNeedsRevision,
    removeRevision,
    submitContentFeedback,
    contentFeedback,
    isBookmarked,
    isMastered,
    isNeedsRevision,
  } = useProgress();

  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'java'>(
    profile.language === 'java' ? 'java' : 'python'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'unhelpful'>('helpful');

  const questionIndex = QUESTIONS.findIndex((q) => q.id === id);
  const question = questionIndex !== -1 ? QUESTIONS[questionIndex] : QUESTIONS[0];

  const prevQuestion = questionIndex > 0 ? QUESTIONS[questionIndex - 1] : null;
  const nextQuestion = questionIndex < QUESTIONS.length - 1 ? QUESTIONS[questionIndex + 1] : null;

  const parentCategory = CATEGORIES.find((c) => c.id === question.categoryId);
  const parentTopic = TOPICS.find((t) => t.id === question.topicId);

  const diffColor = getDifficultyColor(question.difficulty);
  const bookmarked = isBookmarked(question.id);
  const mastered = isMastered(question.id);
  const needsRevision = isNeedsRevision(question.id);
  const currentFeedback = contentFeedback[question.id];

  const handleCopyCode = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendFeedback = () => {
    submitContentFeedback(question.id, {
      rating: feedbackRating,
      comment: feedbackComment,
    });
    setFeedbackModalOpen(false);
    setFeedbackComment('');
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark">
        <div className="flex items-center gap-2 text-xs">
          <Link to="/questions" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Question Bank
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-xs">{parentCategory?.name}</span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => toggleBookmark(question.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              bookmarked
                ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500/40 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-brand-600 text-brand-600 dark:text-brand-300' : ''}`} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          {/* Mastered Button */}
          <button
            type="button"
            onClick={() => toggleMastered(question.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              mastered
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${mastered ? 'text-emerald-600 dark:text-emerald-300' : ''}`} />
            {mastered ? 'Mastered' : 'Mark as Mastered'}
          </button>

          {/* Revision Schedule Button */}
          <button
            type="button"
            onClick={() => (needsRevision ? removeRevision(question.id) : markNeedsRevision(question.id, 3))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              needsRevision
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${needsRevision ? 'text-amber-600 dark:text-amber-300' : ''}`} />
            {needsRevision ? 'In Revision Queue' : 'Add to Revision'}
          </button>

          {/* Playground Launcher */}
          {question.codePlayground && (
            <Link to={`/playground?questionId=${question.id}`}>
              <Button variant="navy" size="sm" className="text-xs">
                <Terminal className="w-3.5 h-3.5 mr-1" /> Open in Playground
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Left Detailed Content, Right TOC & Experience Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (Question Detail) - 3 Columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question Title & Meta Header */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}
              >
                {question.difficulty}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-500/15 px-2 py-0.5 rounded-md">
                {parentCategory?.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {question.minExperienceYears}–{question.maxExperienceYears} Years Experience
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • Estimated ~{question.estimatedTimeMinutes} min
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize bg-slate-50 dark:bg-slate-500/10 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-500/30">
                {question.interviewType.replace('_', ' ')} Interview
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {question.title}
            </h1>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 shadow-nested dark:shadow-nested-dark text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1 uppercase tracking-wider text-xs">
                Question Statement:
              </span>
              {question.statement}
            </div>
          </Card>

          {/* Section 1: Short Interview-Ready Answer */}
          <Card id="short-answer" className="border-l-4 border-l-brand-600">
            <CardHeader className="pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 2-Minute Interview Elevator Pitch
              </span>
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">Concise Interview-Ready Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/30 text-slate-800 dark:text-slate-300 text-sm leading-relaxed">
                {question.shortAnswer}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Deep Conceptual Explanation */}
          <Card id="deep-dive">
            <CardHeader className="pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Architectural Mechanics
              </span>
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">Detailed Conceptual Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal text-sm">
                {question.detailedExplanation}
              </div>

              {/* Practical Real-World Example Box */}
              {question.practicalExample && (
                <div className="mt-5 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/35">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-300" /> Production Scenario & Case Study:
                  </div>
                  <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">{question.practicalExample}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Dual Code Implementations (Python & Java) */}
          {(question.pythonCode || question.javaCode) && (
            <Card id="code-examples">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4" /> Production Implementations
                    </span>
                    <CardTitle className="text-base text-slate-900 dark:text-slate-100">Executable Code Reference</CardTitle>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(activeCodeTab === 'python' ? question.pythonCode : question.javaCode)
                      }
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-500/15 hover:bg-slate-200 hover:dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue={activeCodeTab} value={activeCodeTab} onValueChange={(v) => setActiveCodeTab(v as any)}>
                  <TabsList>
                    {question.pythonCode && (
                      <TabsTrigger value="python" className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" /> Python 3.12+
                      </TabsTrigger>
                    )}
                    {question.javaCode && (
                      <TabsTrigger value="java" className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" /> Java 21 LTS
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {question.pythonCode && (
                    <TabsContent value="python">
                      <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs overflow-x-auto leading-relaxed border border-slate-800 dark:border-slate-700">
                        <code>{question.pythonCode}</code>
                      </pre>
                    </TabsContent>
                  )}

                  {question.javaCode && (
                    <TabsContent value="java">
                      <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs overflow-x-auto leading-relaxed border border-slate-800 dark:border-slate-700">
                        <code>{question.javaCode}</code>
                      </pre>
                    </TabsContent>
                  )}
                </Tabs>

                {/* Complexity analysis banner */}
                {(question.timeComplexity || question.spaceComplexity) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 shadow-nested dark:shadow-nested-dark text-xs">
                    {question.timeComplexity && (
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">Time Complexity:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono mt-0.5 block">{question.timeComplexity}</span>
                      </div>
                    )}
                    {question.spaceComplexity && (
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">Space Complexity:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono mt-0.5 block">{question.spaceComplexity}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 4: Common Pitfalls & Edge Cases */}
          {question.commonMistakes.length > 0 && (
            <Card id="common-mistakes">
              <CardHeader className="pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Watch Out
                </span>
                <CardTitle className="text-base text-slate-900 dark:text-slate-100">Common Candidate Pitfalls & Edge Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {question.commonMistakes.map((mistake, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/35 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        !
                      </span>
                      <span className="leading-relaxed">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Follow-Up Interview Questions */}
          {question.followUpQuestions.length > 0 && (
            <Card id="follow-ups">
              <CardHeader className="pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Next Rounds
                </span>
                <CardTitle className="text-base text-slate-900 dark:text-slate-100">Interviewer Follow-Up Probes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.followUpQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/35 text-xs text-purple-950 dark:text-purple-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700 dark:text-purple-300">Q{idx + 1}.</span>
                        <span className="font-medium">{q}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 6: Content Quality Feedback & Prev/Next Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Was this question helpful?</span>
              <button
                type="button"
                onClick={() => {
                  setFeedbackRating('helpful');
                  setFeedbackModalOpen(true);
                }}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  currentFeedback?.rating === 'helpful'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-500/30 hover:bg-slate-50 hover:dark:bg-slate-500/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackRating('unhelpful');
                  setFeedbackModalOpen(true);
                }}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  currentFeedback?.rating === 'unhelpful'
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-500/30 hover:bg-slate-50 hover:dark:bg-slate-500/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Needs improvement
              </button>
            </div>

            <div className="flex items-center gap-2">
              {prevQuestion && (
                <Link to={`/questions/${prevQuestion.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                  </Button>
                </Link>
              )}
              {nextQuestion && (
                <Link to={`/questions/${nextQuestion.id}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar (TOC & Experience Barometer) */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Experience Barometer: What Interviewers Expect */}
          <Card className="border-t-4 border-t-indigo-600">
            <CardHeader className="pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Interviewer Rubric
              </span>
              <CardTitle className="text-sm text-slate-900 dark:text-slate-100">Expectations by Experience Band</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30">
                <span className="font-bold text-slate-800 dark:text-slate-300 block text-[11px] uppercase tracking-wide">
                  Junior (0–2 Years):
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {question.experienceExpectations.junior}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30">
                <span className="font-bold text-slate-800 dark:text-slate-300 block text-[11px] uppercase tracking-wide">
                  Mid-Level (2–5 Years):
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {question.experienceExpectations.mid}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30">
                <span className="font-bold text-slate-800 dark:text-slate-300 block text-[11px] uppercase tracking-wide">
                  Senior (5–8 Years):
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {question.experienceExpectations.senior}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30">
                <span className="font-bold text-slate-800 dark:text-slate-300 block text-[11px] uppercase tracking-wide">
                  Staff / Lead (8+ Years):
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {question.experienceExpectations.staffOrLead}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Table of Contents */}
          <Card className="hidden lg:block">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Table of Contents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <a href="#short-answer" className="block p-1.5 rounded hover:bg-slate-100 hover:dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:dark:text-brand-300 transition-colors">
                • 2-Min Short Pitch
              </a>
              <a href="#deep-dive" className="block p-1.5 rounded hover:bg-slate-100 hover:dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:dark:text-brand-300 transition-colors">
                • Deep Architectural Dive
              </a>
              <a href="#code-examples" className="block p-1.5 rounded hover:bg-slate-100 hover:dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:dark:text-brand-300 transition-colors">
                • Python & Java Code
              </a>
              <a href="#common-mistakes" className="block p-1.5 rounded hover:bg-slate-100 hover:dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:dark:text-brand-300 transition-colors">
                • Common Pitfalls & Edge Cases
              </a>
              <a href="#follow-ups" className="block p-1.5 rounded hover:bg-slate-100 hover:dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:dark:text-brand-300 transition-colors">
                • Interviewer Follow-Ups
              </a>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Topic Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {question.tags.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Question Feedback"
        description="Help us maintain pristine accuracy and industry relevance across interview content."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rating:</span>
            <span className="text-xs font-bold capitalize text-brand-600 dark:text-brand-300">{feedbackRating}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Additional Notes / Suggestions (Optional)
            </label>
            <textarea
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="e.g. In Python 3.13, PEP 703 provides free-threading builds without the GIL..."
              className="w-full p-3 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendFeedback}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
