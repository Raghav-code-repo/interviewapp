import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useProfile } from '../../context/ProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { CATEGORIES, TOPICS, QUESTIONS } from '../../data/seedData';

export const RoadmapView: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const { profile } = useProfile();
  const { progressMap } = useProgress();

  // Generate role & experience based milestones
  const milestones = [
    {
      id: 'm-1',
      stage: 'Phase 1',
      title: 'Language Internals & Memory Semantics',
      weeks: 'Week 1 - 2',
      description:
        profile.language === 'python'
          ? 'Deep dive into CPython reference counting, cyclic garbage collection, and GIL concurrency limits.'
          : profile.language === 'java'
          ? 'JVM memory regions (Eden, Survivor, Tenured, Metaspace), G1GC/ZGC collectors, and HotSpot JIT compilation.'
          : 'Dual mastery: Compare CPython GIL vs JVM OS-native threading, memory management, and runtime performance.',
      categoryIds: profile.language === 'python' ? ['python', 'systems'] : profile.language === 'java' ? ['java', 'systems'] : ['python', 'java', 'systems'],
      topics: TOPICS.filter((t) => t.categoryId === 'python' || t.categoryId === 'java' || t.categoryId === 'systems'),
    },
    {
      id: 'm-2',
      stage: 'Phase 2',
      title: 'Data Structures, Sliding Windows & Complexity',
      weeks: 'Week 3 - 4',
      description: 'Master optimal time and space complexity heuristics, two-pointer invariants, sliding window patterns, and dynamic programming.',
      categoryIds: ['dsa'],
      topics: TOPICS.filter((t) => t.categoryId === 'dsa'),
    },
    {
      id: 'm-3',
      stage: 'Phase 3',
      title: 'Modern Web Engineering & Full Stack Architecture',
      weeks: 'Week 5 - 6',
      description: 'React Fiber reconciliation, concurrent rendering, Node.js event loop / Spring Boot API engineering, and database indexing.',
      categoryIds: ['fullstack'],
      topics: TOPICS.filter((t) => t.categoryId === 'fullstack'),
    },
    {
      id: 'm-4',
      stage: 'Phase 4',
      title: 'AI, Generative Systems & Model Context Protocol',
      weeks: 'Week 7 - 8',
      description: 'Production RAG architecture (Hybrid search, RRF, Cross-encoder rerankers), tool calling, and MCP server implementations.',
      categoryIds: ['aiml', 'genai'],
      topics: TOPICS.filter((t) => t.categoryId === 'genai' || t.categoryId === 'aiml'),
    },
    {
      id: 'm-5',
      stage: 'Phase 5',
      title: 'Distributed Systems & Senior Engineering Leadership',
      weeks: 'Week 9 - 10',
      description: 'Event-driven saga patterns, transactional outbox with CDC, idempotency keys, CAP tradeoffs, and engineering mentoring.',
      categoryIds: ['architecture'],
      topics: TOPICS.filter((t) => t.categoryId === 'architecture'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Roadmap Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Personalized Preparation Roadmap</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailored specifically for <strong>{profile.name}</strong> ({profile.experienceBand} Years Experience • {profile.targetRole} •{' '}
            {profile.language.toUpperCase()})
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onOpenOnboarding} className="shrink-0">
          Reconfigure Goals
        </Button>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-2.5 md:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {milestones.map((milestone, idx) => {
          // Count progress inside milestone
          const milestoneQuestions = QUESTIONS.filter((q) =>
            milestone.topics.some((t) => t.id === q.topicId)
          );
          const masteredInMilestone = milestoneQuestions.filter(
            (q) => progressMap[q.id]?.status === 'mastered'
          ).length;

          const isCompleted = milestoneQuestions.length > 0 && masteredInMilestone === milestoneQuestions.length;
          const isStarted = masteredInMilestone > 0;

          return (
            <div key={milestone.id} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 md:-left-8 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white ${
                  isCompleted
                    ? 'border-emerald-500 text-emerald-500'
                    : isStarted
                    ? 'border-brand-600 text-brand-600 dark:text-brand-300 ring-4 ring-brand-100'
                    : 'border-slate-300 dark:border-slate-500/40 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 fill-emerald-50 dark:fill-emerald-500/20 text-emerald-600 dark:text-emerald-300" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Milestone Card */}
              <Card className="hover:shadow-card transition-shadow border-slate-200 dark:border-slate-500/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                        {milestone.stage}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {milestone.weeks}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {masteredInMilestone} / {milestoneQuestions.length} Questions Mastered
                    </div>
                  </div>

                  <CardTitle className="text-lg mt-1 text-slate-900 dark:text-slate-100">{milestone.title}</CardTitle>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{milestone.description}</p>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Key Topics in this Phase:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {milestone.topics.map((topic) => {
                      const topicQuestions = QUESTIONS.filter((q) => q.topicId === topic.id);
                      const topicMastered = topicQuestions.filter(
                        (q) => progressMap[q.id]?.status === 'mastered'
                      ).length;

                      return (
                        <div
                          key={topic.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-500/10 hover:bg-white hover:dark:bg-slate-800/70 hover:border-slate-200 hover:dark:border-slate-500/30 hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="difficulty" difficulty={topic.difficulty}>
                                {topic.difficulty}
                              </Badge>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                ~{topic.estimatedMinutes}m
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 line-clamp-1">{topic.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {topic.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {topicMastered} / {topicQuestions.length} completed
                            </span>
                            <Link
                              to={`/questions?topic=${topic.id}`}
                              className="text-[11px] text-brand-600 dark:text-brand-300 hover:text-brand-700 hover:dark:text-brand-300 font-bold flex items-center gap-0.5"
                            >
                              Practice <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
