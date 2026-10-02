import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  Terminal,
  Coffee,
  Cpu,
  HardDrive,
  Layers,
  Brain,
  Sparkles,
  Network,
  ChevronRight,
  BookOpen,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CATEGORIES, SUBJECTS, TOPICS, QUESTIONS } from '../../data/seedData';
import { DifficultyLevel } from '../../types';

export const TaxonomyExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'python':
        return Terminal;
      case 'java':
        return Coffee;
      case 'dsa':
        return Cpu;
      case 'systems':
        return HardDrive;
      case 'fullstack':
        return Layers;
      case 'aiml':
        return Brain;
      case 'genai':
        return Sparkles;
      case 'architecture':
        return Network;
      default:
        return FolderTree;
    }
  };

  const filteredCategories = selectedCategory === 'all'
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-brand-600 dark:text-brand-300" /> Curriculum & Content Taxonomy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarchical interview curriculum: Category → Subject → Topic → Concept → Question.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-500/20'
              }`}
            >
              All Domains
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-500/20'
                }`}
              >
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-8">
        {filteredCategories.map((category) => {
          const IconComponent = getCategoryIcon(category.id);
          const categorySubjects = SUBJECTS.filter((s) => s.categoryId === category.id);
          const categoryTopics = TOPICS.filter((t) => t.categoryId === category.id);
          const categoryQuestions = QUESTIONS.filter((q) => q.categoryId === category.id);

          return (
            <div key={category.id} className="space-y-4" id={category.id}>
              {/* Category Header Card */}
              <div className="p-5 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-500/15 border border-slate-200 dark:border-slate-500/30 flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0 shadow-xs">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      {category.name}
                      <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                        ({categoryTopics.length} topics • {categoryQuestions.length} curated questions)
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{category.description}</p>
                  </div>
                </div>

                <Link to={`/questions?category=${category.id}`}>
                  <Button variant="outline" size="sm" className="shrink-0 text-xs">
                    Browse All {category.name.split(' ')[0]} Questions <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTopics.map((topic) => {
                  const topicQuestions = QUESTIONS.filter((q) => q.topicId === topic.id);
                  const parentSubject = SUBJECTS.find((s) => s.id === topic.subjectId);

                  return (
                    <Card key={topic.id} className="flex flex-col justify-between hover:border-brand-300 hover:dark:border-brand-500/40 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {parentSubject?.name || 'Core'}
                          </span>
                          <Badge variant="difficulty" difficulty={topic.difficulty}>
                            {topic.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{topic.name}</CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {topic.description}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Topic tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {topic.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {topicQuestions.length} practice questions
                          </span>
                          <Link to={`/questions?topic=${topic.id}`}>
                            <span className="text-xs text-brand-600 dark:text-brand-300 hover:text-brand-700 hover:dark:text-brand-300 font-bold flex items-center gap-0.5">
                              View Questions <ChevronRight className="w-3 h-3" />
                            </span>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
