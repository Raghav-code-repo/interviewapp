import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { QUESTIONS, CATEGORIES, TOPICS } from '../../data/seedData';
import { Question, DifficultyLevel, InterviewType } from '../../types';
import { getDifficultyColor } from '../../utils/cn';

export const AdminStudio: React.FC = () => {
  const [questionsList, setQuestionsList] = useState<Question[]>(QUESTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'needs_review'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importExportModal, setImportExportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [exportNotice, setExportNotice] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [detailedExplanation, setDetailedExplanation] = useState('');
  const [categoryId, setCategoryId] = useState('python');
  const [topicId, setTopicId] = useState('topic-py-gil');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [minExp, setMinExp] = useState(2);
  const [maxExp, setMaxExp] = useState(10);
  const [status, setStatus] = useState<'published' | 'draft' | 'needs_review'>('published');

  const filteredQuestions = questionsList.filter((q) => {
    if (searchQuery.trim()) {
      const match =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.statement.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (filterStatus !== 'all' && q.status !== filterStatus) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setTitle('');
    setStatement('');
    setShortAnswer('');
    setDetailedExplanation('');
    setCategoryId('python');
    setTopicId('topic-py-gil');
    setDifficulty('intermediate');
    setMinExp(2);
    setMaxExp(10);
    setStatus('published');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setTitle(q.title);
    setStatement(q.statement);
    setShortAnswer(q.shortAnswer);
    setDetailedExplanation(q.detailedExplanation);
    setCategoryId(q.categoryId);
    setTopicId(q.topicId);
    setDifficulty(q.difficulty);
    setMinExp(q.minExperienceYears);
    setMaxExp(q.maxExperienceYears);
    setStatus(q.status);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!title.trim() || !statement.trim()) return;

    if (editingQuestion) {
      // Update
      setQuestionsList((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                title,
                statement,
                shortAnswer,
                detailedExplanation,
                categoryId,
                topicId,
                difficulty,
                minExperienceYears: Number(minExp),
                maxExperienceYears: Number(maxExp),
                status,
              }
            : q
        )
      );
    } else {
      // Create
      const newQ: Question = {
        id: `q-custom-${Date.now()}`,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        statement,
        shortAnswer,
        detailedExplanation,
        practicalExample: '',
        categoryId,
        subjectId: 'py-fundamentals',
        topicId,
        difficulty,
        interviewType: 'screening',
        estimatedTimeMinutes: 15,
        expectedAnswerDepth: 'Comprehensive overview',
        minExperienceYears: Number(minExp),
        maxExperienceYears: Number(maxExp),
        commonMistakes: [],
        followUpQuestions: [],
        experienceExpectations: {
          junior: 'Understands basic concepts',
          mid: 'Explains trade-offs and runtime behavior',
          senior: 'Deep architectural discussion',
          staffOrLead: 'Organizational strategy & fault recovery',
        },
        prerequisites: [],
        tags: [categoryId, difficulty],
        status,
      };
      setQuestionsList((prev) => [newQ, ...prev]);
    }

    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question from the editorial bank?')) {
      setQuestionsList((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(questionsList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devpath-questions-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setExportNotice('Questions successfully exported as JSON!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuestionsList(parsed);
        setImportExportModal(false);
        setImportJsonText('');
        alert(`Successfully imported ${parsed.length} questions into the studio repository.`);
      } else {
        alert('JSON must be an array of Question objects.');
      }
    } catch (e: any) {
      alert('Invalid JSON format: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-6 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600 dark:text-brand-300" /> Admin Content Studio & Taxonomy CMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage editorial review, lifecycle statuses (Draft / Needs Review / Published), question metadata, and bulk import/export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportExportModal(true)} className="text-xs">
            <Upload className="w-3.5 h-3.5 mr-1" /> Bulk Import
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-fade">
          {exportNotice}
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="p-4 rounded-xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions in studio..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30 rounded-lg text-slate-800 dark:text-slate-300 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'published', 'draft', 'needs_review'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-500/20'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Management Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-500/10 border-b border-slate-200 dark:border-slate-500/30 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3.5">Title & Statement</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Difficulty</th>
                <th className="p-3.5">Experience</th>
                <th className="p-3.5">Editorial Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredQuestions.map((q) => {
                const diffColor = getDifficultyColor(q.difficulty);
                const parentCat = CATEGORIES.find((c) => c.id === q.categoryId);

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 max-w-sm">
                      <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{q.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{q.statement}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                      {parentCat?.name.split(' ')[0] || q.categoryId}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                      {q.minExperienceYears}-{q.maxExperienceYears}y
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          q.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : q.status === 'needs_review'
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30'
                        }`}
                      >
                        {q.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:dark:text-brand-300 hover:bg-brand-50 hover:dark:bg-brand-500/10 transition-colors"
                        title="Edit Question"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 hover:dark:text-red-300 hover:bg-red-50 hover:dark:bg-red-500/10 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Question Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingQuestion ? 'Edit Interview Question' : 'Create New Interview Question'}
        description="Fill in comprehensive technical details, explanations, and experience guidelines."
        maxWidth="2xl"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <Input label="Question Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Question Statement
            </label>
            <textarea
              rows={2}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Domain Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-lg"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-lg capitalize"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Min Exp (Years)"
              type="number"
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
            />
            <Input
              label="Max Exp (Years)"
              type="number"
              value={maxExp}
              onChange={(e) => setMaxExp(Number(e.target.value))}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Editorial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-lg capitalize"
              >
                <option value="published">Published</option>
                <option value="needs_review">Needs Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Short Answer (2-Min Elevator Pitch)
            </label>
            <textarea
              rows={3}
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Detailed Conceptual Explanation
            </label>
            <textarea
              rows={5}
              value={detailedExplanation}
              onChange={(e) => setDetailedExplanation(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveQuestion}>
              Save to Content Bank
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={importExportModal}
        onClose={() => setImportExportModal(false)}
        title="Bulk JSON Content Import"
        description="Paste an array of validated Question objects conforming to the DevPath schema."
      >
        <div className="space-y-4">
          <textarea
            rows={10}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="[ { id: '...', title: '...', statement: '...', ... } ]"
            className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportExportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportJSON} disabled={!importJsonText.trim()}>
              Import Questions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
