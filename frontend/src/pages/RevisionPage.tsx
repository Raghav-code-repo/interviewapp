import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Trash2, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProgress } from '../context/ProgressContext';
import { QUESTIONS, CATEGORIES } from '../data/seedData';
import { getDifficultyColor } from '../utils/cn';

export const RevisionPage: React.FC = () => {
  const { progressMap, markNeedsRevision, removeRevision } = useProgress();

  const revisionItems = Object.values(progressMap).filter((p) => p.needsRevision);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Spaced Repetition & Revision Schedule</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review flagged and difficult concepts at optimal cognitive intervals (1, 3, 7, 14 days) to ensure maximum retention.
            </p>
          </div>
        </div>
      </div>

      {/* Revision List */}
      <div className="space-y-3">
        {revisionItems.length === 0 ? (
          <div className="p-12 text-center bg-panel-light dark:bg-panel-dark rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">Your revision queue is clear!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Whenever you study a challenging interview question, click <strong>&quot;Add to Revision&quot;</strong> to schedule it here for systematic retention.
            </p>
            <Link to="/questions">
              <Button variant="primary" size="sm" className="mt-4 text-xs">
                Browse Questions Bank
              </Button>
            </Link>
          </div>
        ) : (
          revisionItems.map((item) => {
            const q = QUESTIONS.find((question) => question.id === item.questionId);
            if (!q) return null;

            const diffColor = getDifficultyColor(q.difficulty);
            const parentCategory = CATEGORIES.find((c) => c.id === q.categoryId);
            const isOverdue = item.revisionDueDate ? new Date(item.revisionDueDate) <= new Date() : true;

            return (
              <Card
                key={item.questionId}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-amber-500 hover:shadow-card transition-all"
              >
                <div className="space-y-1.5 flex-1 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/15 px-2 py-0.5 rounded-md">
                      {parentCategory?.name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isOverdue ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {isOverdue ? 'Due for review now' : 'Upcoming review'}
                    </span>
                  </div>

                  <Link to={`/questions/${q.id}`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 hover:dark:text-brand-300 transition-colors line-clamp-1">
                      {q.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{q.statement}</p>
                </div>

                {/* Revision actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => removeRevision(q.id)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-500/30 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:dark:text-red-300 hover:bg-red-50 hover:dark:bg-red-500/10 transition-colors"
                    title="Remove from Revision Queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => markNeedsRevision(q.id, 7)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:dark:bg-slate-500/15 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Reschedule in 7 days"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> +7 Days
                  </button>

                  <Link to={`/questions/${q.id}`}>
                    <Button variant="primary" size="sm" className="text-xs">
                      Review Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
