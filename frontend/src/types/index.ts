export type ExperienceBand =
  | '0'
  | '0-2'
  | '2-5'
  | '5-8'
  | '8-12'
  | '12-15'
  | '15-20'
  | '20+';

export type LanguagePreference = 'python' | 'java' | 'both';

export type TargetRole =
  | 'Python Developer'
  | 'Java Developer'
  | 'Full Stack Developer'
  | 'Backend Engineer'
  | 'Senior Software Engineer'
  | 'Software Architect'
  | 'AI/ML Engineer'
  | 'GenAI Engineer'
  | 'Engineering Manager'
  | string;

export type PreparationGoal =
  | 'placement'
  | 'switch'
  | 'promotion'
  | 'screening'
  | 'senior'
  | 'learning';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type InterviewType =
  | 'screening'
  | 'coding'
  | 'practical'
  | 'system_design'
  | 'behavioral';

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

/** The authenticated account, as returned by the API. Never includes secrets. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Candidate profile as persisted by the API. Field names mirror the Prisma
 * `CandidateProfile` model, so they differ from the client-side
 * {@link CandidateProfile} (which uses `language` / `targetRole`).
 */
export interface ServerProfile {
  experienceBand: ExperienceBand;
  experienceYears: number;
  languagePreference: LanguagePreference;
  customRoleName: string | null;
  goal: PreparationGoal;
  dailyGoalQuestions: number;
  customDifficulty: DifficultyLevel | null;
}

/** Payload returned by `/auth/register` and `/auth/login`. */
export interface AuthSession {
  token: string;
  user: AuthUser;
  profile: ServerProfile;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  experienceBand: ExperienceBand;
  language: LanguagePreference;
  targetRole: string;
  goal: PreparationGoal;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Human-readable message plus stable machine code from an API error body. */
export interface ApiErrorShape {
  code: string;
  message: string;
  details?: { path: string; message: string }[];
}

export interface CandidateProfile {
  id: string;
  name: string;
  experienceBand: ExperienceBand;
  experienceYears: number;
  language: LanguagePreference;
  targetRole: TargetRole;
  goal: PreparationGoal;
  customDifficulty?: DifficultyLevel;
  dailyGoalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  badgeColor: string;
  subjectCount: number;
  questionCount: number;
}

export interface Subject {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export interface Topic {
  id: string;
  categoryId: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  questionCount: number;
  icon?: string;
  tags: string[];
}

export interface Concept {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  summary: string;
  keyTakeaway: string;
}

export interface CodeExample {
  language: 'python' | 'java';
  title: string;
  code: string;
  explanation: string;
}

export interface ExperienceExpectations {
  junior: string;     // 0-2 yrs
  mid: string;        // 2-5 yrs
  senior: string;     // 5-8 yrs
  staffOrLead: string; // 8+ yrs
}

export interface CodePlaygroundConfig {
  starterPython: string;
  starterJava: string;
  solutionPython: string;
  solutionJava: string;
  testCases: Array<{
    input: string;
    expected: string;
    description?: string;
  }>;
  hints: string[];
  complexityAnalysis: {
    time: string;
    space: string;
    explanation: string;
  };
}

export interface Question {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  subjectId: string;
  topicId: string;
  conceptId?: string;
  statement: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  estimatedTimeMinutes: number;
  expectedAnswerDepth: string;
  shortAnswer: string;
  detailedExplanation: string;
  practicalExample: string;
  pythonCode?: string;
  javaCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  commonMistakes: string[];
  followUpQuestions: string[];
  experienceExpectations: ExperienceExpectations;
  prerequisites: string[];
  tags: string[];
  relatedQuestionIds?: string[];
  codePlayground?: CodePlaygroundConfig;
  status: 'published' | 'draft' | 'needs_review';
}

export interface UserProgressItem {
  questionId: string;
  status: 'not_started' | 'in_progress' | 'mastered';
  bookmarked: boolean;
  needsRevision: boolean;
  revisionDueDate?: string;
  lastAttemptedAt?: string;
  confidenceScore?: number; // 1-5
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'code_output';
  codeSnippet?: {
    language: 'python' | 'java';
    code: string;
  };
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: DifficultyLevel;
  topicId: string;
}

export interface QuizResult {
  quizId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: Array<{
    questionId: string;
    userAnswerIndex: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
  }>;
  completedAt: string;
}

export interface MockInterviewSession {
  id: string;
  role: string;
  experienceBand: ExperienceBand;
  topicName: string;
  durationMinutes: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  questions: Question[];
  responses: Array<{
    questionId: string;
    candidateAnswer: string;
    timeSpentSeconds: number;
    feedback?: {
      score: number; // 0-10
      strengths: string[];
      areasForImprovement: string[];
      idealPointsCovered: string[];
      aiDisclaimer: string;
    };
  }>;
  overallScore?: number;
  summaryFeedback?: string;
  createdAt: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  order: number;
  categoryId: string;
  topicIds: string[];
  estimatedWeeks: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
}
