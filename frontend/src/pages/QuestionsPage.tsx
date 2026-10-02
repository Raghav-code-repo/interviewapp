import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileQuestion,
  Search,
  Filter,
  Bookmark,
  CheckCircle2,
  Clock,
  ChevronRight,
  Code2,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { QUESTIONS, CATEGORIES, TOPICS } from '../data/seedData';
import { useProgress } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';
import { getDifficultyColor } from '../utils/cn';

export const QuestionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { progressMap, toggleBookmark, isBookmarked, isMastered, isNeedsRevision } = useProgress();
  const { profile } = useProfile();

  const initialCategory = searchParams.get('category') || 'all';
  const initialTopic = searchParams.get('topic') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarked' | 'mastered' | 'revision'>('all');

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchStatement = q.statement.toLowerCase().includes(query);
        const matchTags = q.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchStatement && !matchTags) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && q.categoryId !== selectedCategory) return false;

      // Topic filter (from URL)
      if (initialTopic !== 'all' && q.topicId !== initialTopic) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;

      // Interview Type filter
      if (selectedType !== 'all' && q.interviewType !== selectedType) return false;

      // Progress Tab filter
      if (activeTab === 'bookmarked' && !isBookmarked(q.id)) return false;
      if (activeTab === 'mastered' && !isMastered(q.id)) return false;
      if (activeTab === 'revision' && !isNeedsRevision(q.id)) return false;

      return true;
    });
  }, [searchQuery, selectedCategory, initialTopic, selectedDifficulty, selectedType, activeTab, progressMap]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-brand-600 dark:text-brand-300" /> Curated Interview Question Bank
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive interview questions with short answers, deep explanations, dual code examples, and interviewer criteria.
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-500/30">
            Showing <strong className="text-slate-800 dark:text-slate-300">{filteredQuestions.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-300">{QUESTIONS.length}</strong> questions
          </div>
        </div>

        {/* Search & Main Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, tags, or concepts..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30 rounded-lg text-slate-800 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Domains</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by Difficulty"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 capitalize"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Tab Filters (All, Bookmarked, Mastered, Revision) */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'bookmarked', label: 'Bookmarked' },
            { id: 'mastered', label: 'Mastered' },
            { id: 'revision', label: 'Needs Revision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-500/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-panel-light dark:bg-panel-dark rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">No questions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to browse the entire interview repository.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedType('all');
                setActiveTab('all');
              }}
              className="mt-4 text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diffColor = getDifficultyColor(q.difficulty);
            const parentCategory = CATEGORIES.find((c) => c.id === q.categoryId);
            const parentTopic = TOPICS.find((t) => t.id === q.topicId);
            const bookmarked = isBookmarked(q.id);
            const mastered = isMastered(q.id);

            return (
              <Card
                key={q.id}
                className="hover:border-slate-300 hover:dark:border-slate-500/40 hover:shadow-card transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/15 px-2 py-0.5 rounded-md">
                      {parentCategory?.name.split(' ')[0]}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {q.minExperienceYears}-{q.maxExperienceYears} YOE
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      ~{q.estimatedTimeMinutes}m
                    </span>
                  </div>

                  <Link to={`/questions/${q.id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 hover:dark:text-brand-300 transition-colors line-clamp-1 mt-1">
                      {q.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {q.statement}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {q.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 font-mono border border-slate-100 dark:border-slate-700/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(q.id)}
                      className={`p-2 rounded-lg border transition-colors ${
                        bookmarked
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-500/30 text-slate-400 dark:text-slate-500 hover:text-slate-700 hover:dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                      }`}
                      title={bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    {mastered && (
                      <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30" title="Mastered">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <Link to={`/questions/${q.id}`}>
                    <Button variant="primary" size="sm" className="text-xs">
                      Study <ChevronRight className="w-3.5 h-3.5 ml-1" />
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
