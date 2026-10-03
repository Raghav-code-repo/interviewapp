const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('..', 'frontend', 'src', 'components', 'admin', 'AdminStudio.tsx');

const content = `import React, { useState, useRef } from 'react';
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
  Database,
  FileJson,
  Check,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { QUESTIONS, CATEGORIES, TOPICS } from '../../data/seedData';
import { Question, DifficultyLevel } from '../../types';
import { getDifficultyColor } from '../../utils/cn';
import { getStoredToken } from '../../services/api';

const STORAGE_KEY = 'devpath_admin_custom_questions';

export const AdminStudio: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize questions by merging seed questions with any saved in localStorage
  const [questionsList, setQuestionsList] = useState<Question[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const custom: Question[] = JSON.parse(stored);
        if (Array.isArray(custom) && custom.length > 0) {
          const map = new Map<string, Question>();
          custom.forEach((q) => map.set(q.id, q));
          QUESTIONS.forEach((q) => {
            if (!map.has(q.id)) map.set(q.id, q);
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached questions from localStorage', e);
    }
    return QUESTIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'needs_review'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Import / Export state
  const [importExportModal, setImportExportModal] = useState(false);
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [importJsonText, setImportJsonText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number | null>(null);
  const [parsedDataToImport, setParsedDataToImport] = useState<Question[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Synchronize questions to localStorage whenever questionsList changes
  const persistQuestions = (updatedList: Question[]) => {
    setQuestionsList(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to persist questions to localStorage', e);
    }
  };

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
  const [isSaving, setIsSaving] = useState(false);

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

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedbackNotice({ type, message });
    setTimeout(() => setFeedbackNotice(null), 4500);
  };

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
    setShortAnswer(q.shortAnswer || '');
    setDetailedExplanation(q.detailedExplanation || '');
    setCategoryId(q.categoryId);
    setTopicId(q.topicId);
    setDifficulty(q.difficulty);
    setMinExp(q.minExperienceYears);
    setMaxExp(q.maxExperienceYears);
    setStatus(q.status);
    setIsEditorOpen(true);
  };

  // Helper to normalize and sanitize questions from any source
  const normalizeQuestion = (item: any): Question => {
    const titleVal = String(item.title || item.question || 'Untitled Question').trim();
    const slugVal =
      item.slug ||
      titleVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const catId = item.categoryId || item.category || 'python';
    const diffVal: DifficultyLevel = ['beginner', 'intermediate', 'advanced', 'expert'].includes(
      item.difficulty
    )
      ? item.difficulty
      : 'intermediate';

    return {
      id: item.id || \`q-custom-\${Date.now()}-\${Math.floor(Math.random() * 10000)}\`,
      slug: slugVal,
      title: titleVal,
      statement: String(item.statement || item.description || titleVal),
      shortAnswer: item.shortAnswer || item.summary || '',
      detailedExplanation: item.detailedExplanation || item.explanation || '',
      practicalExample: item.practicalExample || '',
      categoryId: catId,
      subjectId: item.subjectId || 'py-fundamentals',
      topicId: item.topicId || 'topic-py-gil',
      difficulty: diffVal,
      interviewType: item.interviewType || 'screening',
      estimatedTimeMinutes: Number(item.estimatedTimeMinutes || item.timeMinutes || 15),
      expectedAnswerDepth: item.expectedAnswerDepth || 'Standard overview',
      minExperienceYears: Number(item.minExperienceYears ?? 0),
      maxExperienceYears: Number(item.maxExperienceYears ?? 20),
      timeComplexity: item.timeComplexity || undefined,
      spaceComplexity: item.spaceComplexity || undefined,
      commonMistakes: Array.isArray(item.commonMistakes) ? item.commonMistakes : [],
      followUpQuestions: Array.isArray(item.followUpQuestions) ? item.followUpQuestions : [],
      experienceExpectations: item.experienceExpectations || {
        junior: 'Understands basic concepts',
        mid: 'Explains trade-offs and runtime behavior',
        senior: 'Deep architectural discussion',
        staffOrLead: 'Organizational strategy & fault recovery',
      },
      prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : [],
      tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : [catId, diffVal],
      status: ['published', 'draft', 'needs_review'].includes(item.status) ? item.status : 'published',
    };
  };

  const handleSaveQuestion = async () => {
    if (!title.trim() || !statement.trim()) {
      alert('Question title and problem statement are required.');
      return;
    }

    setIsSaving(true);

    const questionPayload: Question = editingQuestion
      ? {
          ...editingQuestion,
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
      : normalizeQuestion({
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
        });

    if (editingQuestion) {
      const updated = questionsList.map((q) => (q.id === editingQuestion.id ? questionPayload : q));
      persistQuestions(updated);
    } else {
      persistQuestions([questionPayload, ...questionsList]);
    }

    const token = getStoredToken();
    let syncedToBackend = false;

    if (token) {
      try {
        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify({
            title: questionPayload.title,
            statement: questionPayload.statement,
            categoryId: questionPayload.categoryId,
            difficulty: questionPayload.difficulty,
            minExperienceYears: questionPayload.minExperienceYears,
            maxExperienceYears: questionPayload.maxExperienceYears,
            shortAnswer: questionPayload.shortAnswer,
            detailedExplanation: questionPayload.detailedExplanation,
            status: questionPayload.status,
          }),
        });

        if (res.ok) {
          syncedToBackend = true;
        }
      } catch (err) {
        console.warn('Backend sync failed, saved to local storage:', err);
      }
    }

    setIsSaving(false);
    setIsEditorOpen(false);

    if (syncedToBackend) {
      showNotification('success', \`Question saved and persisted to Supabase database!\`);
    } else {
      showNotification(
        'info',
        \`Question saved permanently to Studio local storage. (Log in as Admin to sync to Supabase).\`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question from the studio?')) return;

    const updated = questionsList.filter((q) => q.id !== id);
    persistQuestions(updated);

    const token = getStoredToken();
    if (token) {
      try {
        await fetch(\`/api/admin/questions/\${id}\`, {
          method: 'DELETE',
          headers: { Authorization: \`Bearer \${token}\` },
        });
      } catch (e) {
        // Local removal already done
      }
    }

    showNotification('success', 'Question deleted successfully.');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(questionsList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`devpath-questions-export-\${new Date().toISOString().split('T')[0]}.json\`;
    a.click();
    showNotification('success', 'Questions exported as JSON file successfully!');
  };

  const processJsonData = (rawText: string) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(rawText);
      const rawArray = Array.isArray(parsed) ? parsed : [parsed];

      if (rawArray.length === 0) {
        setImportError('JSON file contains an empty array.');
        setParsedDataToImport(null);
        setParsedPreviewCount(null);
        return;
      }

      const normalized: Question[] = rawArray.map(normalizeQuestion);
      setParsedDataToImport(normalized);
      setParsedPreviewCount(normalized.length);
    } catch (e: any) {
      setImportError(\`Invalid JSON format: \${e.message}\`);
      setParsedDataToImport(null);
      setParsedPreviewCount(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      processJsonData(content);
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setImportError('Please upload a valid .json file.');
        return;
      }
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportJsonText(content);
        processJsonData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteImport = async () => {
    if (!parsedDataToImport || parsedDataToImport.length === 0) {
      if (importJsonText.trim()) {
        processJsonData(importJsonText);
      } else {
        alert('Please choose a .json file or paste JSON content first.');
        return;
      }
    }

    if (!parsedDataToImport || parsedDataToImport.length === 0) return;

    const currentMap = new Map(questionsList.map((q) => [q.id, q]));
    parsedDataToImport.forEach((q) => currentMap.set(q.id, q));
    const mergedList = Array.from(currentMap.values());

    persistQuestions(mergedList);

    const token = getStoredToken();
    let backendSynced = false;
    if (token) {
      try {
        const res = await fetch('/api/admin/questions/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify(parsedDataToImport),
        });
        if (res.ok) {
          backendSynced = true;
        }
      } catch (err) {
        console.warn('Backend bulk sync skipped', err);
      }
    }

    const count = parsedDataToImport.length;
    setImportExportModal(false);
    setImportJsonText('');
    setSelectedFileName(null);
    setParsedDataToImport(null);
    setParsedPreviewCount(null);

    if (backendSynced) {
      showNotification('success', \`Imported \${count} questions and synced to Supabase database!\`);
    } else {
      showNotification(
        'success',
        \`Imported \${count} questions permanently to Studio storage! Total active: \${mergedList.length}\`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-6 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-600 dark:text-brand-300" /> Admin Content Studio & Taxonomy CMS
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <Database className="w-3 h-3" /> {questionsList.length} Questions Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage editorial review, lifecycle statuses, Supabase PostgreSQL persistence, and JSON bulk import/export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportExportModal(true);
              setImportError(null);
              setSelectedFileName(null);
              setParsedPreviewCount(null);
            }}
            className="text-xs bg-brand-50/50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 hover:bg-brand-100"
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Upload / Import JSON
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
          </Button>
        </div>
      </div>

      {/* Floating Notice */}
      {feedbackNotice && (
        <div
          className={\`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fade shadow-sm \${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : feedbackNotice.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
          }\`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackNotice.message}</span>
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
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'published', 'draft', 'needs_review'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={\`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors \${
                filterStatus === st
                  ? 'bg-slate-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-700'
              }\`}
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
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3.5">Title & Statement</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Difficulty</th>
                <th className="p-3.5">Experience</th>
                <th className="p-3.5">Editorial Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No questions found matching your filter. Click "Add Question" or "Upload JSON" above.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => {
                  const diffColor = getDifficultyColor(q.difficulty);
                  const parentCat = CATEGORIES.find((c) => c.id === q.categoryId);

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{q.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {q.statement}
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                        {parentCat?.name.split(' ')[0] || q.categoryId}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={\`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase \${diffColor.bg} \${diffColor.text} \${diffColor.border}\`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                        {q.minExperienceYears}-{q.maxExperienceYears}y
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={\`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase \${
                            q.status === 'published'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                              : q.status === 'needs_review'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }\`}
                        >
                          {q.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Question Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingQuestion ? 'Edit Editorial Question' : 'Add New Question to Content Bank'}
        description="Configure taxonomy classification, difficulty, and comprehensive model answers."
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Question Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Explain Python GIL and Multiprocessing"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Problem Statement *
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Detailed interview question prompt..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Topic
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                {TOPICS.filter((t) => t.categoryId === categoryId).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none capitalize"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Min Exp (Yrs)
              </label>
              <Input
                type="number"
                min={0}
                max={25}
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Editorial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
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
              placeholder="Crisp, executive summary of the answer..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
              placeholder="In-depth technical breakdown and trade-offs..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveQuestion} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Persist Question'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import / Upload Modal */}
      <Modal
        isOpen={importExportModal}
        onClose={() => setImportExportModal(false)}
        title="Upload or Import Questions JSON"
        description="Upload a .json file or paste question objects to add them to your content repository."
      >
        <div className="space-y-4">
          {/* Segmented Tab Bar */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setImportTab('file')}
              className={\`flex-1 py-1.5 font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 \${
                importTab === 'file'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }\`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload .json File
            </button>
            <button
              type="button"
              onClick={() => setImportTab('paste')}
              className={\`flex-1 py-1.5 font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 \${
                importTab === 'paste'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }\`}
            >
              <FileJson className="w-3.5 h-3.5" /> Paste JSON Text
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {importTab === 'file' ? (
            /* Drag and Drop Box */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={\`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all \${
                isDragging
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              }\`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 rounded-full">
                  <FileJson className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedFileName ? selectedFileName : 'Drag & drop your .json file here'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    or click to browse from your computer
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse File
                </Button>
              </div>
            </div>
          ) : (
            /* Textarea for Direct Paste */
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                if (e.target.value.trim()) processJsonData(e.target.value);
              }}
              placeholder={\`[\\n  {\\n    "title": "What is Python GIL?",\\n    "statement": "Explain reference counting...",\\n    "difficulty": "advanced",\\n    "categoryId": "python"\\n  }\\n]\`}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100"
            />
          )}

          {/* Validation Status / Error */}
          {importError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {parsedPreviewCount !== null && !importError && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                Validated {parsedPreviewCount} question{parsedPreviewCount === 1 ? '' : 's'} ready to import!
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600">Schema Verified</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setImportExportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteImport}
              disabled={!parsedDataToImport || parsedDataToImport.length === 0}
            >
              Import {parsedPreviewCount ? \`\${parsedPreviewCount} Questions\` : 'Questions'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
`;

fs.writeFileSync(targetFile, content, 'utf8');
console.log('SUCCESS: Written AdminStudio.tsx to', targetFile);
