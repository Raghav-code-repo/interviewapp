import { describe, it, expect } from 'vitest';
import { toQuestionDto } from '../services/questionStore';

/**
 * The database splits a question across three tables while the client expects one
 * flat object. These tests pin the folding rules, in particular that taxonomy
 * references come back as slugs: the UI filters and cross-references by slug, so
 * returning raw UUIDs would silently break every category and topic lookup.
 */
const row = {
  id: 'b1f0c3d2-uuid',
  slug: 'rag-chunking-hybrid-search-reranking',
  title: 'RAG Retrieval Pipeline',
  statement: 'Parse, chunk, index, retrieve, rerank.',
  categoryId: 'cat-uuid',
  category: { slug: 'genai' },
  subjectId: 'sub-uuid',
  subject: { slug: 'genai-rag' },
  topicId: 'top-uuid',
  topic: { slug: 'topic-genai-rag-pipeline' },
  minExperienceYears: 1,
  maxExperienceYears: 18,
  difficulty: 'advanced',
  interviewType: 'system_design',
  estimatedTimeMinutes: 25,
  expectedAnswerDepth: 'Design a production RAG pipeline.',
  timeComplexity: 'O(T^2 * d)',
  spaceComplexity: 'O(N*d)',
  commonMistakes: ['Using only fixed character chunks.'],
  followUpQuestions: ['How do you evaluate retrieval independently of generation?'],
  prerequisites: ['Embeddings'],
  tags: ['GenAI', 'RAG'],
  status: 'published',
  answers: [
    {
      shortAnswer: 'Ingestion -> chunking -> retrieval -> reranking.',
      detailedExplanation: 'Structure-aware chunks with metadata.',
      practicalExample: 'def rrf(rank, k=60): ...',
      juniorExpectation: 'Explains basic RAG.',
      midExpectation: 'Builds chunking and vector retrieval.',
      seniorExpectation: 'Designs hybrid retrieval and reranking.',
      staffExpectation: 'Architects multi-tenant RAG.',
    },
  ],
  codeExamples: [
    { language: 'python', codeSnippet: 'def rrf(): ...' },
    { language: 'java', codeSnippet: 'double rrf() { ... }' },
  ],
} as never;

describe('toQuestionDto', () => {
  const dto = toQuestionDto(row) as Record<string, any>;

  it('emits taxonomy slugs rather than UUIDs', () => {
    expect(dto.categoryId).toBe('genai');
    expect(dto.subjectId).toBe('genai-rag');
    expect(dto.topicId).toBe('topic-genai-rag-pipeline');
  });

  it('folds the Answer row into flat answer fields', () => {
    expect(dto.shortAnswer).toBe('Ingestion -> chunking -> retrieval -> reranking.');
    expect(dto.practicalExample).toBe('def rrf(rank, k=60): ...');
  });

  it('maps level expectations onto the client object shape', () => {
    expect(dto.experienceExpectations).toEqual({
      junior: 'Explains basic RAG.',
      mid: 'Builds chunking and vector retrieval.',
      senior: 'Designs hybrid retrieval and reranking.',
      staffOrLead: 'Architects multi-tenant RAG.',
    });
  });

  it('splits code examples by language', () => {
    expect(dto.pythonCode).toBe('def rrf(): ...');
    expect(dto.javaCode).toBe('double rrf() { ... }');
  });

  it('keeps array columns and scalar metadata intact', () => {
    expect(dto.commonMistakes).toEqual(['Using only fixed character chunks.']);
    expect(dto.followUpQuestions).toHaveLength(1);
    expect(dto.tags).toEqual(['GenAI', 'RAG']);
    expect(dto.difficulty).toBe('advanced');
    expect(dto.interviewType).toBe('system_design');
    expect(dto.estimatedTimeMinutes).toBe(25);
    expect(dto.status).toBe('published');
  });
});

describe('toQuestionDto with missing children', () => {
  it('falls back to empty strings when a question has no Answer row', () => {
    const dto = toQuestionDto({ ...(row as object), answers: [] } as never) as Record<string, any>;

    expect(dto.shortAnswer).toBe('');
    expect(dto.detailedExplanation).toBe('');
    expect(dto.experienceExpectations).toEqual({
      junior: '',
      mid: '',
      senior: '',
      staffOrLead: '',
    });
  });

  it('leaves absent code languages undefined rather than inventing them', () => {
    const dto = toQuestionDto({
      ...(row as object),
      codeExamples: [{ language: 'python', codeSnippet: 'x = 1' }],
    } as never) as Record<string, any>;

    expect(dto.pythonCode).toBe('x = 1');
    expect(dto.javaCode).toBeUndefined();
  });
});