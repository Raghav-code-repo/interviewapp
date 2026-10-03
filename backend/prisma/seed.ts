import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EXPERIENCE_LEVELS = [
  { band: '0', minYears: 0, maxYears: 0, title: 'Student / Fresher', description: 'Foundational syntax, basic DSA and learning core concepts.' },
  { band: '0-2', minYears: 0, maxYears: 2, title: 'Junior Software Engineer', description: 'Guided implementation work with mentorship on design decisions.' },
  { band: '2-5', minYears: 2, maxYears: 5, title: 'Mid-level Software Engineer', description: 'Independent feature delivery, code review participation, debugging fluency.' },
  { band: '5-8', minYears: 5, maxYears: 8, title: 'Senior Software Engineer', description: 'System design ownership, cross-team coordination, production reliability.' },
  { band: '8-12', minYears: 8, maxYears: 12, title: 'Staff Engineer', description: 'Multi-system architecture, technical strategy and org-wide standards.' },
  { band: '12-15', minYears: 12, maxYears: 15, title: 'Principal Engineer', description: 'Company-wide technical vision, platform strategy, long-horizon trade-offs.' },
  { band: '15-20', minYears: 15, maxYears: 20, title: 'Distinguished Engineer', description: 'Industry influence, foundational technology bets, mentoring at scale.' },
  { band: '20+', minYears: 20, maxYears: 30, title: 'Fellow / VP Engineering', description: 'Organizational governance, engineering strategy and executive communication.' },
];

const TARGET_ROLES = [
  { name: 'Python Developer', slug: 'python-developer' },
  { name: 'Java Developer', slug: 'java-developer' },
  { name: 'Full Stack Developer', slug: 'full-stack-developer' },
  { name: 'Backend Engineer', slug: 'backend-engineer' },
  { name: 'Senior Software Engineer', slug: 'senior-software-engineer' },
  { name: 'Software Architect', slug: 'software-architect' },
  { name: 'AI/ML Engineer', slug: 'ai-ml-engineer' },
  { name: 'GenAI Engineer', slug: 'genai-engineer' },
  { name: 'Engineering Manager', slug: 'engineering-manager' },
];

async function main() {
  console.log('🌱 Starting DevPath Interview Academy database seeding...');

  // 1. Reference data used by CandidateProfile foreign keys.
  for (const level of EXPERIENCE_LEVELS) {
    await prisma.experienceLevel.upsert({
      where: { band: level.band },
      update: { minYears: level.minYears, maxYears: level.maxYears, title: level.title, description: level.description },
      create: level,
    });
  }
  console.log(`✓ Seeded ${EXPERIENCE_LEVELS.length} experience levels.`);

  for (const role of TARGET_ROLES) {
    await prisma.targetRole.upsert({
      where: { slug: role.slug },
      update: { name: role.name },
      create: { name: role.name, slug: role.slug, description: `Target role: ${role.name}` },
    });
  }
  console.log(`✓ Seeded ${TARGET_ROLES.length} target roles.`);

  // 2. Demo candidate account.
  const backendRole = await prisma.targetRole.findUnique({ where: { slug: 'backend-engineer' } });

  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'alex@devpath.io' },
    update: {},
    create: {
      email: 'alex@devpath.io',
      passwordHash: hashedPassword,
      name: 'Alex Rivera',
      role: 'candidate',
      profile: {
        create: {
          experienceBand: '2-5',
          experienceYears: 3,
          languagePreference: 'both',
          goal: 'switch',
          dailyGoalQuestions: 5,
          targetRoleId: backendRole?.id ?? null,
          customRoleName: 'Backend Engineer',
        },
      },
    },
  });
  console.log(`✓ Seeded user: ${demoUser.email}`);

  // 3. Admin account, required to reach the protected Content Studio endpoints.
  //    Change this password before deploying anywhere real.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin12345';
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@devpath.io' },
    update: { role: 'admin' },
    create: {
      email: 'admin@devpath.io',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: 'DevPath Admin',
      role: 'admin',
      profile: {
        create: {
          experienceBand: '8-12',
          experienceYears: 10,
          languagePreference: 'both',
          goal: 'senior',
          dailyGoalQuestions: 5,
          customRoleName: 'Engineering Manager',
        },
      },
    },
  });
  console.log(`✓ Seeded admin: ${adminUser.email} (password: ${adminPassword})`);

  // 4. Taxonomy categories.
  const categoriesData = [
    { slug: 'python', name: 'Python Ecosystem', description: 'Core syntax, OOP, dunder methods, generators, GIL, asyncio, and packaging.', iconName: 'Terminal', orderIndex: 1 },
    { slug: 'java', name: 'Java & Spring Ecosystem', description: 'JVM internals, GC algorithms, multithreading, concurrency locks, streams, and Spring Boot.', iconName: 'Coffee', orderIndex: 2 },
    { slug: 'dsa', name: 'Data Structures & Algorithms', description: 'Linear & tree structures, graphs, dynamic programming, backtracking, and complexity patterns.', iconName: 'Cpu', orderIndex: 3 },
    { slug: 'systems', name: 'Memory & Systems Programming', description: 'Stack/Heap allocation, virtual memory, OS scheduling, deadlocks, networking sockets, and profiling.', iconName: 'HardDrive', orderIndex: 4 },
    { slug: 'fullstack', name: 'Full Stack & Web Engineering', description: 'Modern React, state machines, Node.js event loop, FastAPI, PostgreSQL indexing, and web security.', iconName: 'Layers', orderIndex: 5 },
    { slug: 'aiml', name: 'AI, ML & Deep Learning', description: 'Numpy, Pandas, feature engineering, backpropagation, CNN/RNN/Transformers, PyTorch, and MLOps.', iconName: 'Brain', orderIndex: 6 },
    { slug: 'genai', name: 'Generative AI & Agentic Systems', description: 'LLM tokenization, RAG chunking & vector search, prompt routing, tool calling, and MCP architecture.', iconName: 'Sparkles', orderIndex: 7 },
    { slug: 'architecture', name: 'Software Architecture & Leadership', description: 'System design, event-driven microservices, distributed consistency, CAP theorem, and tech mentoring.', iconName: 'Network', orderIndex: 8 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ Seeded ${categoriesData.length} taxonomy categories.`);

  // 5. Taxonomy Subjects
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  const subjectsData = [
    { slug: 'fundamentals-syntax', categorySlug: 'python', name: 'Fundamentals & Syntax', description: 'Variables, scoping, mutability, and standard idioms', orderIndex: 1 },
    { slug: 'oop-dunder-methods', categorySlug: 'python', name: 'OOP & Dunder Methods', description: 'Classes, inheritance, metaclasses, decorators, descriptors', orderIndex: 2 },
    { slug: 'memory-management-gil', categorySlug: 'python', name: 'Memory Management & GIL', description: 'Reference counting, cyclic GC, GIL limitations and workarounds', orderIndex: 3 },
    { slug: 'concurrency-asyncio', categorySlug: 'python', name: 'Concurrency & Asyncio', description: 'Threading vs multiprocessing vs asyncio event loop', orderIndex: 4 },

    { slug: 'core-jvm-internals', categorySlug: 'java', name: 'Core Java & JVM Internals', description: 'Bytecode, class loaders, JVM memory spaces (Metaspace, Heap)', orderIndex: 1 },
    { slug: 'collections-generics', categorySlug: 'java', name: 'Collections & Generics', description: 'ArrayList, HashMap internals, ConcurrentHashMap, Streams API', orderIndex: 2 },
    { slug: 'concurrency-multithreading', categorySlug: 'java', name: 'Concurrency & Multithreading', description: 'Synchronized, Locks, atomic variables, virtual threads (Project Loom)', orderIndex: 3 },
    { slug: 'spring-boot-jpa', categorySlug: 'java', name: 'Spring Boot & JPA', description: 'Dependency Injection, Hibernate N+1, Transaction management', orderIndex: 4 },

    { slug: 'arrays-two-pointers', categorySlug: 'dsa', name: 'Arrays & Two Pointers', description: 'Subarrays, sliding window, two pointer techniques', orderIndex: 1 },
    { slug: 'trees-graphs', categorySlug: 'dsa', name: 'Trees & Graphs', description: 'Binary trees, BST, BFS, DFS, Dijkstra, topological sort', orderIndex: 2 },
    { slug: 'dynamic-programming', categorySlug: 'dsa', name: 'Dynamic Programming', description: 'Memoization, tabulation, knapsack, state-machine DP', orderIndex: 3 },

    { slug: 'memory-architecture', categorySlug: 'systems', name: 'Memory Architecture', description: 'Stack vs heap, memory fragmentation, cache locality, paging', orderIndex: 1 },
    { slug: 'os-concurrency', categorySlug: 'systems', name: 'Operating Systems & Concurrency', description: 'Processes vs threads, context switching, synchronization primitives', orderIndex: 2 },

    { slug: 'frontend-react', categorySlug: 'fullstack', name: 'Frontend Architecture & React', description: 'Virtual DOM, reconciliation, React server components, re-renders', orderIndex: 1 },
    { slug: 'nodejs-api-engineering', categorySlug: 'fullstack', name: 'Node.js & API Engineering', description: 'Libuv event loop, streams, REST, GraphQL, WebSocket patterns', orderIndex: 2 },
    { slug: 'databases-performance', categorySlug: 'fullstack', name: 'Databases & Performance', description: 'B-Trees, indexing, connection pooling, transactions, ACID', orderIndex: 3 },

    { slug: 'ml-foundations', categorySlug: 'aiml', name: 'ML Foundations & Algorithms', description: 'Linear algebra, loss functions, gradient descent, overfitting', orderIndex: 1 },
    { slug: 'deep-learning-transformers', categorySlug: 'aiml', name: 'Deep Learning & Transformers', description: 'Self-attention, multi-head attention, backprop, embeddings', orderIndex: 2 },

    { slug: 'rag-vector-search', categorySlug: 'genai', name: 'RAG & Vector Search', description: 'Embedding models, HNSW, hybrid search, rerankers, semantic cache', orderIndex: 1 },
    { slug: 'ai-agents-mcp', categorySlug: 'genai', name: 'AI Agents & MCP Architecture', description: 'ReAct loops, function calling, tool use, Model Context Protocol', orderIndex: 2 },
    // Added when the Content Studio import started writing to Postgres instead of
    // an in-memory array. Without these the taxonomy rows only existed as a side
    // effect of an import, and a fresh `prisma:seed` left imported questions
    // pointing at subject ids that no longer existed.
    { slug: 'genai-rag', categorySlug: 'genai', name: 'GenAI Retrieval & Foundations', description: 'Transformers, tokenization, prompting, embeddings, RAG pipelines, evaluation and grounding', orderIndex: 3 },
    { slug: 'genai-agents', categorySlug: 'genai', name: 'GenAI Agents & Platform', description: 'Agent architecture, MCP, structured output, memory, security, observability and interview prep', orderIndex: 4 },

    { slug: 'distributed-systems', categorySlug: 'architecture', name: 'Distributed Systems & Scaling', description: 'CAP theorem, consistent hashing, CQRS, event sourcing', orderIndex: 1 },
    { slug: 'patterns-leadership', categorySlug: 'architecture', name: 'Design Patterns & Leadership', description: 'SOLID principles, microservices boundaries, tech debt, mentoring', orderIndex: 2 },
  ];

  for (const s of subjectsData) {
    const categoryId = categoryMap.get(s.categorySlug);
    if (categoryId) {
      await prisma.subject.upsert({
        where: { slug: s.slug },
        update: { name: s.name, description: s.description, orderIndex: s.orderIndex },
        create: {
          categoryId,
          name: s.name,
          slug: s.slug,
          description: s.description,
          orderIndex: s.orderIndex,
        },
      });
    }
  }
  console.log(`✓ Seeded ${subjectsData.length} taxonomy subjects.`);

  // 6. Taxonomy Topics
  const allSubjects = await prisma.subject.findMany();
  const subjectMap = new Map(allSubjects.map((s) => [s.slug, s.id]));

  const topicsData = [
    { slug: 'gil-and-memory-model', subjectSlug: 'memory-management-gil', name: 'Global Interpreter Lock (GIL) & Memory Model', description: 'Understand how CPython manages reference counting, cyclic garbage collection, and thread locking.', difficulty: 'advanced', estimatedMinutes: 45, tags: ['Python', 'Internals', 'GIL', 'Garbage Collection', 'Concurrency'] },
    { slug: 'generators-iterators-context-managers', subjectSlug: 'fundamentals-syntax', name: 'Generators, Iterators & Context Managers', description: 'Deep dive into generator yield expressions, memory efficiency, and protocol dunder methods.', difficulty: 'intermediate', estimatedMinutes: 35, tags: ['Python', 'Generators', 'Memory Efficiency', 'Protocols'] },
    { slug: 'asyncio-event-loop', subjectSlug: 'concurrency-asyncio', name: 'Asyncio Event Loop & Coroutines', description: 'Non-blocking I/O, event loops, tasks, futures, and avoiding CPU-bound deadlocks.', difficulty: 'advanced', estimatedMinutes: 40, tags: ['Python', 'Asyncio', 'Event Loop', 'Non-blocking IO'] },

    { slug: 'jvm-memory-architecture-gc', subjectSlug: 'core-jvm-internals', name: 'JVM Memory Architecture & GC Tuning', description: 'Eden, Survivor, Tenured, Metaspace, G1GC, ZGC, and troubleshooting OutOfMemoryErrors.', difficulty: 'advanced', estimatedMinutes: 50, tags: ['Java', 'JVM', 'Garbage Collection', 'G1GC', 'Memory'] },
    { slug: 'java-concurrency-structures', subjectSlug: 'concurrency-multithreading', name: 'Java Concurrency & ConcurrentHashMap', description: 'Volatile keyword, CAS (Compare-And-Swap), ReentrantLock, and thread-safe data structures.', difficulty: 'advanced', estimatedMinutes: 45, tags: ['Java', 'Multithreading', 'ConcurrentHashMap', 'CAS', 'Locks'] },
    { slug: 'spring-boot-jpa-performance', subjectSlug: 'spring-boot-jpa', name: 'Spring Boot Performance & Hibernate N+1', description: 'Solving N+1 queries using entity graphs, fetch joins, and managing transactional boundaries.', difficulty: 'intermediate', estimatedMinutes: 30, tags: ['Java', 'Spring Boot', 'Hibernate', 'JPA', 'Performance'] },

    { slug: 'sliding-window-two-pointers', subjectSlug: 'arrays-two-pointers', name: 'Sliding Window & Two Pointer Techniques', description: 'Linear time optimizations for substring, subarray, and target-sum problems.', difficulty: 'intermediate', estimatedMinutes: 40, tags: ['DSA', 'Arrays', 'Sliding Window', 'Algorithms'] },
    { slug: 'binary-tree-traversals-lca', subjectSlug: 'trees-graphs', name: 'Binary Tree Traversals & LCA', description: 'Recursive vs iterative traversals, lowest common ancestor, diameter, and serialization.', difficulty: 'intermediate', estimatedMinutes: 45, tags: ['DSA', 'Trees', 'BFS', 'DFS', 'Recursion'] },
    { slug: 'dp-memoization-tabulation', subjectSlug: 'dynamic-programming', name: 'Dynamic Programming: Memoization to Tabulation', description: 'Recognizing optimal substructure, overlapping subproblems, and state transitions.', difficulty: 'advanced', estimatedMinutes: 60, tags: ['DSA', 'Dynamic Programming', 'Optimization', 'Algorithms'] },

    { slug: 'stack-vs-heap-memory-allocations', subjectSlug: 'memory-architecture', name: 'Stack vs Heap & Memory Allocations', description: 'Call frame allocation, cache locality, memory leaks, and pointer safety.', difficulty: 'intermediate', estimatedMinutes: 35, tags: ['Systems', 'Memory', 'Stack', 'Heap', 'Pointers'] },

    { slug: 'react-fiber-reconciliation', subjectSlug: 'frontend-react', name: 'React Fiber, Reconciliation & State Batches', description: 'How the Fiber tree works, concurrent rendering, keys, and avoiding excessive re-renders.', difficulty: 'advanced', estimatedMinutes: 45, tags: ['Frontend', 'React', 'Fiber', 'Performance', 'JavaScript'] },

    { slug: 'production-rag-vector-search', subjectSlug: 'rag-vector-search', name: 'Production RAG Architecture & Vector Search', description: 'Chunking strategies, embedding drift, dense vs sparse retrieval, and cross-encoder rerankers.', difficulty: 'advanced', estimatedMinutes: 50, tags: ['GenAI', 'RAG', 'Vector DB', 'Embeddings', 'LLM'] },
    { slug: 'ai-agents-mcp-architecture', subjectSlug: 'ai-agents-mcp', name: 'AI Agent Architectures & Model Context Protocol (MCP)', description: 'Tool use protocols, structured outputs, JSON schemas, loop safety, and agent memory state.', difficulty: 'expert', estimatedMinutes: 55, tags: ['GenAI', 'MCP', 'AI Agents', 'Tool Calling', 'Architecture'] },

    // Topics created on demand by the Content Studio import. Declared here so a
    // fresh `prisma:seed` reproduces the taxonomy the import relies on.
    { slug: 'topic-genai-transformers', subjectSlug: 'genai-rag', name: 'Transformers: Self-Attention & Positional Encoding', description: 'Q/K/V projections, multi-head attention, causal masking, RoPE and ALiBi.', difficulty: 'intermediate', estimatedMinutes: 25, tags: ['GenAI', 'Transformers', 'Attention'] },
    { slug: 'topic-genai-llm-training', subjectSlug: 'genai-rag', name: 'LLM Pretraining, Instruction Tuning & Alignment', description: 'Next-token pretraining, supervised instruction tuning, RLHF and DPO.', difficulty: 'intermediate', estimatedMinutes: 20, tags: ['GenAI', 'LLM', 'Fine-tuning', 'RLHF', 'DPO'] },
    { slug: 'topic-genai-tokenization', subjectSlug: 'genai-rag', name: 'Tokenization & Context Budgeting', description: 'BPE/SentencePiece tokenizers, context windows, and token budget planning.', difficulty: 'intermediate', estimatedMinutes: 15, tags: ['GenAI', 'Tokenization', 'Context Window'] },
    { slug: 'topic-genai-prompt-engineering', subjectSlug: 'genai-rag', name: 'Prompt Engineering & Injection Defence', description: 'Structured prompts, few-shot examples, delimiters and indirect prompt injection.', difficulty: 'intermediate', estimatedMinutes: 20, tags: ['GenAI', 'Prompt Engineering', 'Security'] },
    { slug: 'topic-genai-embeddings', subjectSlug: 'genai-rag', name: 'Embeddings & Similarity Search', description: 'Cosine similarity, ANN indexes, HNSW and embedding model selection.', difficulty: 'intermediate', estimatedMinutes: 20, tags: ['GenAI', 'Embeddings', 'Vector Search', 'ANN'] },
    { slug: 'topic-genai-rag-pipeline', subjectSlug: 'genai-rag', name: 'RAG Retrieval Pipeline', description: 'Chunking, hybrid retrieval, fusion, reranking, context assembly and citations.', difficulty: 'advanced', estimatedMinutes: 25, tags: ['GenAI', 'RAG', 'Hybrid Search', 'Reranking'] },
    { slug: 'topic-genai-rag-evaluation', subjectSlug: 'genai-rag', name: 'RAG Evaluation', description: 'Recall@K, MRR, nDCG, faithfulness and answer relevance measurement.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'RAG', 'Evaluation'] },
    { slug: 'topic-genai-model-adaptation', subjectSlug: 'genai-rag', name: 'Fine-Tuning vs RAG vs Prompt Engineering', description: 'Choosing an adaptation strategy and combining prompt, retrieval and tuning.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'Fine-tuning', 'RAG', 'LoRA'] },
    { slug: 'topic-genai-llmops', subjectSlug: 'genai-rag', name: 'LLM Inference Optimization', description: 'KV cache, quantization, continuous batching and streaming for production serving.', difficulty: 'advanced', estimatedMinutes: 25, tags: ['GenAI', 'LLMOps', 'Inference', 'Quantization'] },
    { slug: 'topic-genai-vector-database', subjectSlug: 'genai-rag', name: 'Vector Databases & Multi-Tenancy', description: 'HNSW tuning, metadata filtering, sharding and tenant isolation.', difficulty: 'advanced', estimatedMinutes: 25, tags: ['GenAI', 'Vector Database', 'HNSW', 'Multi-Tenancy'] },
    { slug: 'topic-genai-observability', subjectSlug: 'genai-rag', name: 'LLM Observability', description: 'Tracing, token cost, latency percentiles, quality and failure monitoring.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'Observability', 'Cost'] },
    { slug: 'topic-genai-system-design', subjectSlug: 'genai-rag', name: 'Enterprise AI System Design', description: 'Service decomposition, tenant-aware authorization and failure handling at scale.', difficulty: 'expert', estimatedMinutes: 30, tags: ['GenAI', 'System Design', 'Enterprise AI'] },
    { slug: 'topic-genai-rag-coding', subjectSlug: 'genai-rag', name: 'Coding: Hybrid Rank Fusion', description: 'Implementing Reciprocal Rank Fusion over dense and lexical result lists.', difficulty: 'intermediate', estimatedMinutes: 25, tags: ['GenAI', 'Coding', 'RRF', 'Hybrid Search'] },
    { slug: 'topic-genai-grounding', subjectSlug: 'genai-rag', name: 'Hallucination Reduction & Grounding', description: 'Evidence boundaries, citations, abstention and post-generation verification.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'Hallucination', 'Grounding'] },
    { slug: 'topic-genai-ingestion', subjectSlug: 'genai-rag', name: 'Document Ingestion', description: 'Format-aware parsing, OCR, table extraction, ACL propagation and incremental indexing.', difficulty: 'advanced', estimatedMinutes: 25, tags: ['GenAI', 'Ingestion', 'PDF', 'Data Pipeline'] },
    { slug: 'topic-genai-multimodal', subjectSlug: 'genai-rag', name: 'Multimodal GenAI', description: 'Vision-language models, document images and preserving page-level citations.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'Multimodal', 'Vision'] },

    { slug: 'topic-genai-agents-architecture', subjectSlug: 'genai-agents', name: 'Agent Architecture: ReAct & Tool Calling', description: 'Agent loops, tool schemas, planning, memory and bounded execution.', difficulty: 'advanced', estimatedMinutes: 25, tags: ['GenAI', 'Agents', 'ReAct', 'Tool Calling'] },
    { slug: 'topic-genai-mcp-agents', subjectSlug: 'genai-agents', name: 'Model Context Protocol', description: 'MCP hosts, clients, servers, tools, resources and prompts.', difficulty: 'expert', estimatedMinutes: 25, tags: ['GenAI', 'MCP', 'Integration'] },
    { slug: 'topic-genai-ai-security', subjectSlug: 'genai-agents', name: 'LLM Application Security', description: 'Prompt injection, data leakage, jailbreaks and tool abuse controls.', difficulty: 'expert', estimatedMinutes: 25, tags: ['GenAI', 'AI Security', 'Prompt Injection', 'Guardrails'] },
    { slug: 'topic-genai-structured-output', subjectSlug: 'genai-agents', name: 'Function Calling & Structured Output', description: 'JSON Schema constrained generation, validation and bounded retries.', difficulty: 'intermediate', estimatedMinutes: 15, tags: ['GenAI', 'Structured Output', 'Function Calling'] },
    { slug: 'topic-genai-agent-memory', subjectSlug: 'genai-agents', name: 'LLM Memory Design', description: 'Conversation history, rolling summaries, semantic memory and retention.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'Memory', 'Context Management'] },
    { slug: 'topic-genai-agent-design', subjectSlug: 'genai-agents', name: 'Workflow vs Agent Design', description: 'Choosing deterministic workflows over autonomous loops.', difficulty: 'advanced', estimatedMinutes: 20, tags: ['GenAI', 'Agents', 'Workflows'] },
    { slug: 'topic-genai-agent-coding', subjectSlug: 'genai-agents', name: 'Coding: Safe Tool-Calling Agent Loop', description: 'Implementing a bounded agent loop with a validated tool registry.', difficulty: 'advanced', estimatedMinutes: 25, tags: ['GenAI', 'Agents', 'Coding', 'Security'] },
    { slug: 'topic-genai-interview', subjectSlug: 'genai-agents', name: 'GenAI Project Deep Dive', description: 'Presenting an end-to-end GenAI project: problem, architecture, evaluation and results.', difficulty: 'intermediate', estimatedMinutes: 20, tags: ['GenAI', 'Interview Preparation'] },
    { slug: 'topic-genai-interview-roadmap', subjectSlug: 'genai-agents', name: 'GenAI Preparation Roadmap', description: 'A staged preparation plan covering foundations through system design.', difficulty: 'intermediate', estimatedMinutes: 15, tags: ['GenAI', 'Roadmap', 'Career'] },

    { slug: 'event-driven-saga-pattern', subjectSlug: 'distributed-systems', name: 'Event-Driven Systems & Distributed Transactions (Saga)', description: 'Kafka/RabbitMQ event streams, choreography vs orchestration sagas, and idempotency keys.', difficulty: 'expert', estimatedMinutes: 60, tags: ['System Design', 'Microservices', 'Kafka', 'Saga', 'Idempotency'] },
  ];

  for (const t of topicsData) {
    const subjectId = subjectMap.get(t.subjectSlug);
    if (subjectId) {
      await prisma.topic.upsert({
        where: { slug: t.slug },
        update: { name: t.name, description: t.description, difficulty: t.difficulty, estimatedMinutes: t.estimatedMinutes, tags: t.tags },
        create: {
          subjectId,
          name: t.name,
          slug: t.slug,
          description: t.description,
          difficulty: t.difficulty,
          estimatedMinutes: t.estimatedMinutes,
          tags: t.tags,
        },
      });
    }
  }
  console.log(`✓ Seeded ${topicsData.length} taxonomy topics.`);

  // 7. Initial Questions Bank
  const allTopics = await prisma.topic.findMany();
  const topicMap = new Map(allTopics.map((t) => [t.slug, t.id]));

  const initialQuestions = [
    {
      slug: 'cpython-global-interpreter-lock-parallelism',
      title: 'Explain the Global Interpreter Lock (GIL) in CPython and How to Achieve True Parallelism',
      categorySlug: 'python',
      subjectSlug: 'memory-management-gil',
      topicSlug: 'gil-and-memory-model',
      minExperienceYears: 2,
      maxExperienceYears: 15,
      difficulty: 'advanced',
      interviewType: 'screening',
      estimatedTimeMinutes: 15,
      expectedAnswerDepth: 'Detailed architectural walkthrough of CPython reference counting, bytecode evaluation loop, and concurrency alternatives.',
      statement: 'What is the Global Interpreter Lock (GIL) in CPython, why does it exist, and how does it affect CPU-bound versus I/O-bound multi-threaded programs? How can a high-throughput Python service achieve true multicore parallelism?',
      shortAnswer: 'The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing CPython bytecodes at once. It exists primarily because CPython’s memory management uses non-thread-safe reference counting. For I/O-bound tasks, threads release the GIL while waiting on sockets/disk, making threading effective. For CPU-bound tasks, threads thrash on GIL contention, so multicore parallelism requires multiprocessing, process pools, native C/Rust extensions (which release the GIL), or Python 3.13+ free-threaded builds (PEP 703).',
      detailedExplanation: 'CPython tracks object lifecycles using reference counting supplemented by a cyclic garbage collector. Every time an object is referenced, its internal ob_refcnt field increments. Without a global lock, concurrent threads updating reference counts across shared objects would trigger race conditions and memory corruption.',
      practicalExample: 'In image processing, running 4 threads resizing images runs slower than 1 single thread due to GIL contention. Converting the service to ProcessPoolExecutor scales throughput linearly across all physical CPU cores.',
      pythonCode: 'from concurrent.futures import ProcessPoolExecutor\n\ndef cpu_task(n: int) -> int:\n    return sum(i * i for i in range(n))\n\nwith ProcessPoolExecutor() as executor:\n    results = list(executor.map(cpu_task, [10000000] * 4))',
      javaCode: 'import java.util.stream.*;\n\nLongStream.of(10000000L, 10000000L).parallel().map(n -> n * 2).toArray();',
      timeComplexity: 'O(N) CPU operations distributed across P processes -> O(N / P) wall-clock time.',
      spaceComplexity: 'O(P * M) process base footprint.',
      tags: ['Python', 'GIL', 'CPython', 'Concurrency', 'Memory Management'],
    },
    {
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters (Optimal Sliding Window)',
      categorySlug: 'dsa',
      subjectSlug: 'arrays-two-pointers',
      topicSlug: 'sliding-window-two-pointers',
      minExperienceYears: 0,
      maxExperienceYears: 10,
      difficulty: 'intermediate',
      interviewType: 'coding',
      estimatedTimeMinutes: 20,
      expectedAnswerDepth: 'Derive from O(N^2) brute force to O(N) sliding window with hash map storing last seen index.',
      statement: 'Given a string s, find the length of the longest substring without duplicate characters. Provide optimal solutions in Python and Java, analyzing time and space complexity.',
      shortAnswer: 'Maintain a dynamic sliding window [left, right]. Use a hash map storing each character’s most recent index. When a duplicate character is encountered within the current window, move the left pointer forward past the duplicate index (left = max(left, last_seen[char] + 1)). Update the character’s position and compute max_len = max(max_len, right - left + 1). This runs in O(N) time and O(min(N, charset)) space.',
      detailedExplanation: 'Initialize left = 0 and max_length = 0. Iterate right pointer from 0 to len(s) - 1. If char is in table and table[char] >= left, set left = table[char] + 1. Update table[char] = right and max_length = max(max_length, right - left + 1).',
      practicalExample: 'Input s = "abcabcbb". Window expands "abc" (length 3), jumps left pointer past duplicate a, output is 3.',
      pythonCode: 'def length_of_longest_substring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len',
      javaCode: 'import java.util.HashMap;\npublic class Solution {\n    public static int lengthOfLongestSubstring(String s) {\n        HashMap<Character, Integer> map = new HashMap<>();\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (map.containsKey(c) && map.get(c) >= left) left = map.get(c) + 1;\n            map.put(c, right);\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}',
      timeComplexity: 'O(N) single pass.',
      spaceComplexity: 'O(min(N, charset size)).',
      tags: ['DSA', 'Arrays', 'Strings', 'Sliding Window', 'Two Pointers'],
    },
    {
      slug: 'production-rag-chunking-hybrid-search-reranking',
      title: 'Production RAG Architecture: Chunking, Hybrid Search, Vector Embeddings & Reranking',
      categorySlug: 'genai',
      subjectSlug: 'rag-vector-search',
      topicSlug: 'production-rag-vector-search',
      minExperienceYears: 2,
      maxExperienceYears: 18,
      difficulty: 'advanced',
      interviewType: 'system_design',
      estimatedTimeMinutes: 25,
      expectedAnswerDepth: 'End-to-end design covering document ingestion, semantic chunking, dense vector retrieval vs sparse BM25, cross-encoder rerankers, and hallucination guardrails.',
      statement: 'How do you design an enterprise-grade Retrieval-Augmented Generation (RAG) system for a knowledge base of 500,000 technical manuals? How do you overcome context loss from chunking, semantic retrieval misses, and LLM hallucinations?',
      shortAnswer: 'A production RAG architecture requires a multi-stage pipeline: (1) Ingestion with semantic/recursive chunking; (2) Multi-representation indexing pairing dense vector embeddings with sparse keyword indexes (BM25); (3) Hybrid Search with Reciprocal Rank Fusion (RRF); (4) Cross-Encoder Reranking on top 50 candidates; (5) Context compression/prompt assembly with citation constraints; and (6) Post-generation validation via fact-checking guardrails.',
      detailedExplanation: 'Reciprocal Rank Fusion merges dense vector matches with keyword matches. Cross-encoders examine query and document candidate pairs jointly, computing deep attention scores.',
      practicalExample: 'In medical manuals, BM25 ensures rare drug brand names match exactly while dense vectors match symptom descriptions.',
      pythonCode: 'def rrf_score(dense_rank: int, sparse_rank: int, k: int = 60) -> float:\n    return (1.0 / (k + dense_rank)) + (1.0 / (k + sparse_rank))',
      javaCode: 'public double rrfScore(int denseRank, int sparseRank, int k) {\n    return (1.0 / (k + denseRank)) + (1.0 / (k + sparseRank));\n}',
      timeComplexity: 'HNSW vector search: O(log N). Cross-encoder: O(K * SeqLen^2) on top K=50 candidates.',
      spaceComplexity: 'Vector index: ~4 bytes * dimensions * N vectors.',
      tags: ['Generative AI', 'RAG', 'Vector Search', 'LLMs', 'System Design'],
    },
  ];

  for (const q of initialQuestions) {
    const categoryId = categoryMap.get(q.categorySlug);
    const subjectId = subjectMap.get(q.subjectSlug);
    const topicId = topicMap.get(q.topicSlug);

    if (categoryId && subjectId && topicId) {
      const createdQ = await prisma.question.upsert({
        where: { slug: q.slug },
        update: {
          title: q.title,
          statement: q.statement,
          difficulty: q.difficulty,
          status: 'published',
        },
        create: {
          slug: q.slug,
          title: q.title,
          statement: q.statement,
          categoryId,
          subjectId,
          topicId,
          minExperienceYears: q.minExperienceYears,
          maxExperienceYears: q.maxExperienceYears,
          difficulty: q.difficulty,
          interviewType: q.interviewType,
          estimatedTimeMinutes: q.estimatedTimeMinutes,
          expectedAnswerDepth: q.expectedAnswerDepth,
          timeComplexity: q.timeComplexity,
          spaceComplexity: q.spaceComplexity,
          tags: q.tags,
          status: 'published',
        },
      });

      // Upsert Answer
      const existingAnswer = await prisma.answer.findFirst({ where: { questionId: createdQ.id } });
      if (existingAnswer) {
        await prisma.answer.update({
          where: { id: existingAnswer.id },
          data: {
            shortAnswer: q.shortAnswer,
            detailedExplanation: q.detailedExplanation,
            practicalExample: q.practicalExample,
          },
        });
      } else {
        await prisma.answer.create({
          data: {
            questionId: createdQ.id,
            shortAnswer: q.shortAnswer,
            detailedExplanation: q.detailedExplanation,
            practicalExample: q.practicalExample,
          },
        });
      }

      // Upsert Code Examples
      if (q.pythonCode) {
        const existingPy = await prisma.codeExample.findFirst({
          where: { questionId: createdQ.id, language: 'python' },
        });
        if (!existingPy) {
          await prisma.codeExample.create({
            data: {
              questionId: createdQ.id,
              language: 'python',
              title: 'Python Implementation',
              codeSnippet: q.pythonCode,
            },
          });
        }
      }

      if (q.javaCode) {
        const existingJava = await prisma.codeExample.findFirst({
          where: { questionId: createdQ.id, language: 'java' },
        });
        if (!existingJava) {
          await prisma.codeExample.create({
            data: {
              questionId: createdQ.id,
              language: 'java',
              title: 'Java Implementation',
              codeSnippet: q.javaCode,
            },
          });
        }
      }
    }
  }
  console.log(`✓ Seeded ${initialQuestions.length} core interview questions and answers.`);

  console.log('✅ DevPath Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    console.error(
      '\nIf this is a connection error, check that DATABASE_URL in backend/.env is correct and that your IP is allow-listed in the Supabase dashboard.'
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
