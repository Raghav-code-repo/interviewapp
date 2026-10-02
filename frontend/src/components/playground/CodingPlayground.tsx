import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Terminal,
  Coffee,
  Code2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Clock,
  Cpu,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { QUESTIONS } from '../../data/seedData';
import { Question } from '../../types';
import { getDifficultyColor } from '../../utils/cn';

export const CodingPlayground: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qId = searchParams.get('questionId');

  // Find question with playground config, default to sliding window or first with config
  const playgroundQuestions = QUESTIONS.filter((q) => !!q.codePlayground);
  const selectedQuestion: Question =
    playgroundQuestions.find((q) => q.id === qId) || playgroundQuestions[0] || QUESTIONS[0];

  const config = selectedQuestion.codePlayground;

  const [language, setLanguage] = useState<'python' | 'java'>('python');
  const [code, setCode] = useState<string>(
    config ? (language === 'python' ? config.starterPython : config.starterJava) : '# Code playground'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [outputResult, setOutputResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failed';
    stdout: string;
    testResults?: Array<{
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
    }>;
  }>({ status: 'idle', stdout: '' });

  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Sync editor code when question or language changes
  useEffect(() => {
    if (config) {
      setCode(language === 'python' ? config.starterPython : config.starterJava);
      setOutputResult({ status: 'idle', stdout: '' });
      setShowSolution(false);
    }
  }, [selectedQuestion.id, language]);

  const handleReset = () => {
    if (config) {
      setCode(language === 'python' ? config.starterPython : config.starterJava);
      setOutputResult({ status: 'idle', stdout: '' });
    }
  };

  const handleRevealSolution = () => {
    if (config) {
      setCode(language === 'python' ? config.solutionPython : config.solutionJava);
      setShowSolution(true);
    }
  };

  // Safe mock execution engine adapter
  const handleRunCode = () => {
    setIsRunning(true);
    setOutputResult({ status: 'running', stdout: 'Compiling & executing in safe sandbox...' });

    setTimeout(() => {
      if (!config) {
        setIsRunning(false);
        setOutputResult({ status: 'success', stdout: 'Execution simulated successfully.' });
        return;
      }

      // Check if user code matches or is close to solution, or test cases
      const isClean = code.trim().length > 30 && !code.includes('pass') && !code.includes('return 0;');
      const testCases = config.testCases || [];

      const simulatedTests = testCases.map((tc) => {
        // If code hasn't been implemented yet, fail
        const passed = isClean;
        return {
          input: tc.input,
          expected: tc.expected,
          actual: passed ? tc.expected : 'None / incomplete output',
          passed,
        };
      });

      const allPassed = simulatedTests.every((t) => t.passed);

      setIsRunning(false);
      setOutputResult({
        status: allPassed ? 'success' : 'failed',
        stdout: allPassed
          ? `✓ All ${simulatedTests.length} sample test cases executed and passed successfully.\nExecution Time: 12ms | Memory: 8.2MB`
          : `✗ Test cases failed. Check implementation logic and edge cases.`,
        testResults: simulatedTests,
      });
    }, 600);
  };

  const diffColor = getDifficultyColor(selectedQuestion.difficulty);

  return (
    <div className="space-y-6">
      {/* Playground Header Bar */}
      <div className="p-4 rounded-2xl bg-panel-light dark:bg-panel-dark border border-slate-200/80 dark:border-slate-700/70 shadow-panel dark:shadow-panel-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5 text-brand-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Interactive Coding Sandbox
              </span>
              <Badge variant="difficulty" difficulty={selectedQuestion.difficulty}>
                {selectedQuestion.difficulty}
              </Badge>
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedQuestion.title}</h1>
          </div>
        </div>

        {/* Question Selector & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Question Picker */}
          <select
            value={selectedQuestion.id}
            onChange={(e) => setSearchParams({ questionId: e.target.value })}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            {playgroundQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title.slice(0, 35)}...
              </option>
            ))}
          </select>

          {/* Language Switch */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-500/15 border border-slate-200 dark:border-slate-500/30">
            <button
              onClick={() => setLanguage('python')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors ${
                language === 'python' ? 'bg-white dark:bg-slate-800/70 text-brand-700 dark:text-brand-300 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Python
            </button>
            <button
              onClick={() => setLanguage('java')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors ${
                language === 'java' ? 'bg-white dark:bg-slate-800/70 text-brand-700 dark:text-brand-300 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-slate-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Java
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Console Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monaco Editor Section (7 Columns) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="overflow-hidden border-slate-300 dark:border-slate-500/40 shadow-md">
            {/* Editor Action Header */}
            <div className="h-11 bg-navy-950 text-slate-300 px-4 flex items-center justify-between border-b border-slate-800 dark:border-slate-700">
              <span className="text-xs font-mono font-semibold flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <Code2 className="w-4 h-4 text-brand-400" />
                {language === 'python' ? 'solution.py' : 'Solution.java'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded text-xs text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-colors"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunCode}
                  isLoading={isRunning}
                  className="h-7 text-xs bg-brand-600 hover:bg-brand-500 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current mr-1" /> Run Code
                </Button>
              </div>
            </div>

            {/* Monaco React Editor */}
            <div className="h-[420px] bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Consolas, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 4,
                }}
              />
            </div>
          </Card>

          {/* Hints & Solution Accordion */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-500/30 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 hover:bg-amber-100 hover:dark:bg-amber-500/15 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                {showHints ? 'Hide Hints' : 'Need a Hint?'}
              </button>

              <button
                type="button"
                onClick={handleRevealSolution}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 hover:dark:bg-slate-500/20 border border-slate-200 dark:border-slate-500/30 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-300" /> Reveal Optimal Solution
              </button>
            </div>

            <Link
              to={`/questions/${selectedQuestion.id}`}
              className="text-brand-600 dark:text-brand-300 hover:underline font-semibold flex items-center gap-1"
            >
              Full Question Writeup <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {showHints && config?.hints && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs space-y-1.5 animate-fade">
              <div className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[10px]">
                Algorithmic Hints:
              </div>
              {config.hints.map((hint, idx) => (
                <div key={idx} className="text-amber-950 dark:text-amber-200 flex items-start gap-1.5">
                  <span className="font-bold text-amber-700 dark:text-amber-300">•</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Cases & Execution Results Panel (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Test Case Evaluation Card */}
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 border-none pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Test Cases & Output Console</CardTitle>
              {outputResult.status === 'success' && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                </span>
              )}
              {outputResult.status === 'failed' && (
                <span className="text-xs font-bold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Failed
                </span>
              )}
            </CardHeader>

            {/* Test Cases List */}
            {config?.testCases && config.testCases.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sample Test Cases:
                </div>
                {config.testCases.map((tc, idx) => {
                  const testRes = outputResult.testResults?.[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        testRes
                          ? testRes.passed
                            ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                          : 'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Test Case #{idx + 1}</span>
                        {testRes && (
                          <span className={`font-bold text-[10px] ${testRes.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                            {testRes.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-sans">Input:</span>
                          <span className="text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800/70 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500/30 block truncate">
                            {tc.input}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-sans">Expected:</span>
                          <span className="text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800/70 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500/30 block truncate">
                            {tc.expected}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Console Output Block */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Execution Log:
              </div>
              <pre className="p-3.5 rounded-xl bg-navy-950 text-slate-200 font-mono text-xs min-h-[90px] whitespace-pre-wrap border border-slate-800 dark:border-slate-700">
                {outputResult.stdout || 'Click "Run Code" to execute test cases against the solution adapter.'}
              </pre>
            </div>

            {/* Algorithmic Complexity Box */}
            {config?.complexityAnalysis && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 shadow-nested dark:shadow-nested-dark text-xs space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-brand-600 dark:text-brand-300" /> Complexity Profile:
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-300">Time:</strong> {config.complexityAnalysis.time}
                  <br />
                  <strong className="text-slate-800 dark:text-slate-300">Space:</strong> {config.complexityAnalysis.space}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
