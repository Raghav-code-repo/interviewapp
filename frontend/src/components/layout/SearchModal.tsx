import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, BookOpen, Layers, Code, Hash } from 'lucide-react';
import { QUESTIONS, TOPICS, CATEGORIES } from '../../data/seedData';
import { getDifficultyColor } from '../../utils/cn';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC dismisses the palette. The footer advertises this shortcut, but no
      // handler was registered for it, so the modal could not be closed with the
      // keyboard once open.
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredQuestions = trimmed
    ? QUESTIONS.filter(
        (q) =>
          q.title.toLowerCase().includes(trimmed) ||
          q.statement.toLowerCase().includes(trimmed) ||
          q.tags.some((t) => t.toLowerCase().includes(trimmed))
      )
    : [];

  const filteredTopics = trimmed
    ? TOPICS.filter(
        (t) =>
          t.name.toLowerCase().includes(trimmed) ||
          t.description.toLowerCase().includes(trimmed) ||
          t.tags.some((tag) => tag.toLowerCase().includes(trimmed))
      )
    : [];

  const handleSelectQuestion = (id: string) => {
    onClose();
    navigate(`/questions/${id}`);
  };

  const handleSelectTopic = (id: string) => {
    onClose();
    navigate(`/explore#${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-panel-light dark:bg-panel-dark rounded-2xl shadow-lift border border-slate-200 dark:border-slate-600/70 z-10 overflow-hidden animate-enter">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-500/30">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, JVM, GIL, RAG, SAGAs, LeetCode patterns... (ESC to close)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:dark:text-slate-300 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!trimmed && (
            <div className="text-center py-8">
              <div className="flex justify-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-500/15 text-xs text-slate-600 dark:text-slate-300 font-mono">Python GIL</span>
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-500/15 text-xs text-slate-600 dark:text-slate-300 font-mono">JVM ZGC</span>
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-500/15 text-xs text-slate-600 dark:text-slate-300 font-mono">Sliding Window</span>
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-500/15 text-xs text-slate-600 dark:text-slate-300 font-mono">RAG Hybrid Search</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Type keywords or tags above to jump directly into questions and topics.</p>
            </div>
          )}

          {trimmed && filteredQuestions.length === 0 && filteredTopics.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
              No matching questions or topics found for &ldquo;<span className="font-semibold">{query}</span>&rdquo;.
            </div>
          )}

          {/* Topics matches */}
          {filteredTopics.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Topics ({filteredTopics.length})
              </div>
              <div className="space-y-1">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 hover:dark:bg-slate-500/10 flex items-center justify-between border border-transparent hover:border-slate-200 hover:dark:border-slate-500/30 transition-all group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-300 group-hover:text-brand-600 group-hover:dark:text-brand-300 transition-colors">
                        {topic.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{topic.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-600 group-hover:dark:text-brand-300 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions matches */}
          {filteredQuestions.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Questions ({filteredQuestions.length})
              </div>
              <div className="space-y-1.5">
                {filteredQuestions.map((q) => {
                  const diffColor = getDifficultyColor(q.difficulty);
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(q.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 hover:dark:bg-slate-500/10 flex items-start justify-between border border-transparent hover:border-slate-200 hover:dark:border-slate-500/30 transition-all group"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {q.minExperienceYears}-{q.maxExperienceYears} yrs exp
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-300 group-hover:text-brand-600 group-hover:dark:text-brand-300 transition-colors line-clamp-1">
                          {q.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{q.statement}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-600 group-hover:dark:text-brand-300 group-hover:translate-x-1 transition-all mt-2 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-500/10 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Navigate with mouse or click item to open</span>
          <span className="font-mono">Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
