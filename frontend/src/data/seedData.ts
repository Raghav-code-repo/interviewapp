import {
  Category,
  Subject,
  Topic,
  Question,
  QuizQuestion,
  CandidateProfile,
} from '../types';

export const INITIAL_DEMO_PROFILE: CandidateProfile = {
  id: 'demo-candidate-1',
  name: 'Alex Rivera',
  experienceBand: '2-5',
  experienceYears: 3,
  language: 'both',
  targetRole: 'Backend Engineer',
  goal: 'switch',
  customDifficulty: 'intermediate',
  dailyGoalQuestions: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const CATEGORIES: Category[] = [
  {
    id: 'python',
    name: 'Python Ecosystem',
    slug: 'python',
    description: 'Core syntax, OOP, dunder methods, generators, GIL, asyncio, and packaging.',
    iconName: 'Terminal',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    subjectCount: 6,
    questionCount: 16,
  },
  {
    id: 'java',
    name: 'Java & Spring Ecosystem',
    slug: 'java',
    description: 'JVM internals, GC algorithms, multithreading, concurrency locks, streams, and Spring Boot.',
    iconName: 'Coffee',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    subjectCount: 7,
    questionCount: 15,
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    slug: 'dsa',
    description: 'Linear & tree structures, graphs, dynamic programming, backtracking, and complexity patterns.',
    iconName: 'Cpu',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    subjectCount: 5,
    questionCount: 18,
  },
  {
    id: 'systems',
    name: 'Memory & Systems Programming',
    slug: 'systems',
    description: 'Stack/Heap allocation, virtual memory, OS scheduling, deadlocks, networking sockets, and profiling.',
    iconName: 'HardDrive',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    subjectCount: 6,
    questionCount: 14,
  },
  {
    id: 'fullstack',
    name: 'Full Stack & Web Engineering',
    slug: 'fullstack',
    description: 'Modern React, state machines, Node.js event loop, FastAPI, PostgreSQL indexing, and web security.',
    iconName: 'Layers',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    subjectCount: 8,
    questionCount: 17,
  },
  {
    id: 'aiml',
    name: 'AI, ML & Deep Learning',
    slug: 'aiml',
    description: 'Numpy, Pandas, feature engineering, backpropagation, CNN/RNN/Transformers, PyTorch, and MLOps.',
    iconName: 'Brain',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    subjectCount: 7,
    questionCount: 14,
  },
  {
    id: 'genai',
    name: 'Generative AI & Agentic Systems',
    slug: 'genai',
    description: 'LLM tokenization, RAG chunking & vector search, prompt routing, tool calling, and MCP architecture.',
    iconName: 'Sparkles',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    subjectCount: 7,
    questionCount: 16,
  },
  {
    id: 'architecture',
    name: 'Software Architecture & Leadership',
    slug: 'architecture',
    description: 'System design, event-driven microservices, distributed consistency, CAP theorem, and tech mentoring.',
    iconName: 'Network',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    subjectCount: 6,
    questionCount: 15,
  },
];

export const SUBJECTS: Subject[] = [
  // Python
  { id: 'py-fundamentals', categoryId: 'python', name: 'Fundamentals & Syntax', slug: 'fundamentals-syntax', description: 'Variables, scoping, mutability, and standard idioms', order: 1 },
  { id: 'py-oop', categoryId: 'python', name: 'OOP & Dunder Methods', slug: 'oop-dunder-methods', description: 'Classes, inheritance, metaclasses, decorators, descriptors', order: 2 },
  { id: 'py-memory', categoryId: 'python', name: 'Memory Management & GIL', slug: 'memory-management-gil', description: 'Reference counting, cyclic GC, GIL limitations and workarounds', order: 3 },
  { id: 'py-concurrency', categoryId: 'python', name: 'Concurrency & Asyncio', slug: 'concurrency-asyncio', description: 'Threading vs multiprocessing vs asyncio event loop', order: 4 },

  // Java
  { id: 'java-core', categoryId: 'java', name: 'Core Java & JVM Internals', slug: 'core-jvm-internals', description: 'Bytecode, class loaders, JVM memory spaces (Metaspace, Heap)', order: 1 },
  { id: 'java-collections', categoryId: 'java', name: 'Collections & Generics', slug: 'collections-generics', description: 'ArrayList, HashMap internals, ConcurrentHashMap, Streams API', order: 2 },
  { id: 'java-concurrency', categoryId: 'java', name: 'Concurrency & Multithreading', slug: 'concurrency-multithreading', description: 'Synchronized, Locks, atomic variables, virtual threads (Project Loom)', order: 3 },
  { id: 'java-spring', categoryId: 'java', name: 'Spring Boot & JPA', slug: 'spring-boot-jpa', description: 'Dependency Injection, Hibernate N+1, Transaction management', order: 4 },

  // DSA
  { id: 'dsa-arrays', categoryId: 'dsa', name: 'Arrays & Two Pointers', slug: 'arrays-two-pointers', description: 'Subarrays, sliding window, two pointer techniques', order: 1 },
  { id: 'dsa-trees', categoryId: 'dsa', name: 'Trees & Graphs', slug: 'trees-graphs', description: 'Binary trees, BST, BFS, DFS, Dijkstra, topological sort', order: 2 },
  { id: 'dsa-dp', categoryId: 'dsa', name: 'Dynamic Programming', slug: 'dynamic-programming', description: 'Memoization, tabulation, knapsack, state-machine DP', order: 3 },

  // Systems
  { id: 'sys-memory', categoryId: 'systems', name: 'Memory Architecture', slug: 'memory-architecture', description: 'Stack vs heap, memory fragmentation, cache locality, paging', order: 1 },
  { id: 'sys-os', categoryId: 'systems', name: 'Operating Systems & Concurrency', slug: 'os-concurrency', description: 'Processes vs threads, context switching, synchronization primitives', order: 2 },

  // Full Stack
  { id: 'fs-frontend', categoryId: 'fullstack', name: 'Frontend Architecture & React', slug: 'frontend-react', description: 'Virtual DOM, reconciliation, React server components, re-renders', order: 1 },
  { id: 'fs-backend', categoryId: 'fullstack', name: 'Node.js & API Engineering', slug: 'nodejs-api-engineering', description: 'Libuv event loop, streams, REST, GraphQL, WebSocket patterns', order: 2 },
  { id: 'fs-databases', categoryId: 'fullstack', name: 'Databases & Performance', slug: 'databases-performance', description: 'B-Trees, indexing, connection pooling, transactions, ACID', order: 3 },

  // AI/ML
  { id: 'aiml-foundations', categoryId: 'aiml', name: 'ML Foundations & Algorithms', slug: 'ml-foundations', description: 'Linear algebra, loss functions, gradient descent, overfitting', order: 1 },
  { id: 'aiml-deep', categoryId: 'aiml', name: 'Deep Learning & Transformers', slug: 'deep-learning-transformers', description: 'Self-attention, multi-head attention, backprop, embeddings', order: 2 },

  // GenAI
  { id: 'genai-rag', categoryId: 'genai', name: 'RAG & Vector Search', slug: 'rag-vector-search', description: 'Embedding models, HNSW, hybrid search, rerankers, semantic cache', order: 1 },
  { id: 'genai-agents', categoryId: 'genai', name: 'AI Agents & MCP Architecture', slug: 'ai-agents-mcp', description: 'ReAct loops, function calling, tool use, Model Context Protocol', order: 2 },

  // Architecture
  { id: 'arch-sysdesign', categoryId: 'architecture', name: 'Distributed Systems & Scaling', slug: 'distributed-systems', description: 'CAP theorem, consistent hashing, CQRS, event sourcing', order: 1 },
  { id: 'arch-patterns', categoryId: 'architecture', name: 'Design Patterns & Leadership', slug: 'patterns-leadership', description: 'SOLID principles, microservices boundaries, tech debt, mentoring', order: 2 },
];

export const TOPICS: Topic[] = [
  // Python Topics
  {
    id: 'topic-py-gil',
    categoryId: 'python',
    subjectId: 'py-memory',
    name: 'Global Interpreter Lock (GIL) & Memory Model',
    slug: 'gil-and-memory-model',
    description: 'Understand how CPython manages reference counting, cyclic garbage collection, and thread locking.',
    difficulty: 'advanced',
    estimatedMinutes: 45,
    questionCount: 3,
    tags: ['Python', 'Internals', 'GIL', 'Garbage Collection', 'Concurrency'],
  },
  {
    id: 'topic-py-generators',
    categoryId: 'python',
    subjectId: 'py-fundamentals',
    name: 'Generators, Iterators & Context Managers',
    slug: 'generators-iterators-context-managers',
    description: 'Deep dive into generator yield expressions, memory efficiency, and protocol dunder methods.',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    questionCount: 3,
    tags: ['Python', 'Generators', 'Memory Efficiency', 'Protocols'],
  },
  {
    id: 'topic-py-asyncio',
    categoryId: 'python',
    subjectId: 'py-concurrency',
    name: 'Asyncio Event Loop & Coroutines',
    slug: 'asyncio-event-loop',
    description: 'Non-blocking I/O, event loops, tasks, futures, and avoiding CPU-bound deadlocks.',
    difficulty: 'advanced',
    estimatedMinutes: 40,
    questionCount: 2,
    tags: ['Python', 'Asyncio', 'Event Loop', 'Non-blocking IO'],
  },

  // Java Topics
  {
    id: 'topic-java-jvm-memory',
    categoryId: 'java',
    subjectId: 'java-core',
    name: 'JVM Memory Architecture & GC Tuning',
    slug: 'jvm-memory-architecture-gc',
    description: 'Eden, Survivor, Tenured, Metaspace, G1GC, ZGC, and troubleshooting OutOfMemoryErrors.',
    difficulty: 'advanced',
    estimatedMinutes: 50,
    questionCount: 3,
    tags: ['Java', 'JVM', 'Garbage Collection', 'G1GC', 'Memory'],
  },
  {
    id: 'topic-java-concurrency',
    categoryId: 'java',
    subjectId: 'java-concurrency',
    name: 'Java Concurrency & ConcurrentHashMap',
    slug: 'java-concurrency-structures',
    description: 'Volatile keyword, CAS (Compare-And-Swap), ReentrantLock, and thread-safe data structures.',
    difficulty: 'advanced',
    estimatedMinutes: 45,
    questionCount: 3,
    tags: ['Java', 'Multithreading', 'ConcurrentHashMap', 'CAS', 'Locks'],
  },
  {
    id: 'topic-java-spring-jpa',
    categoryId: 'java',
    subjectId: 'java-spring',
    name: 'Spring Boot Performance & Hibernate N+1',
    slug: 'spring-boot-jpa-performance',
    description: 'Solving N+1 queries using entity graphs, fetch joins, and managing transactional boundaries.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    questionCount: 2,
    tags: ['Java', 'Spring Boot', 'Hibernate', 'JPA', 'Performance'],
  },

  // DSA Topics
  {
    id: 'topic-dsa-sliding-window',
    categoryId: 'dsa',
    subjectId: 'dsa-arrays',
    name: 'Sliding Window & Two Pointer Techniques',
    slug: 'sliding-window-two-pointers',
    description: 'Linear time optimizations for substring, subarray, and target-sum problems.',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    questionCount: 3,
    tags: ['DSA', 'Arrays', 'Sliding Window', 'Algorithms'],
  },
  {
    id: 'topic-dsa-trees',
    categoryId: 'dsa',
    subjectId: 'dsa-trees',
    name: 'Binary Tree Traversals & LCA',
    slug: 'binary-tree-traversals-lca',
    description: 'Recursive vs iterative traversals, lowest common ancestor, diameter, and serialization.',
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    questionCount: 3,
    tags: ['DSA', 'Trees', 'BFS', 'DFS', 'Recursion'],
  },
  {
    id: 'topic-dsa-dp',
    categoryId: 'dsa',
    subjectId: 'dsa-dp',
    name: 'Dynamic Programming: Memoization to Tabulation',
    slug: 'dp-memoization-tabulation',
    description: 'Recognizing optimal substructure, overlapping subproblems, and state transitions.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    questionCount: 3,
    tags: ['DSA', 'Dynamic Programming', 'Optimization', 'Algorithms'],
  },

  // Systems Topics
  {
    id: 'topic-sys-stack-heap',
    categoryId: 'systems',
    subjectId: 'sys-memory',
    name: 'Stack vs Heap & Memory Allocations',
    slug: 'stack-vs-heap-memory-allocations',
    description: 'Call frame allocation, cache locality, memory leaks, and pointer safety.',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    questionCount: 2,
    tags: ['Systems', 'Memory', 'Stack', 'Heap', 'Pointers'],
  },

  // Full Stack Topics
  {
    id: 'topic-fs-react-reconciliation',
    categoryId: 'fullstack',
    subjectId: 'fs-frontend',
    name: 'React Fiber, Reconciliation & State Batches',
    slug: 'react-fiber-reconciliation',
    description: 'How the Fiber tree works, concurrent rendering, keys, and avoiding excessive re-renders.',
    difficulty: 'advanced',
    estimatedMinutes: 45,
    questionCount: 3,
    tags: ['Frontend', 'React', 'Fiber', 'Performance', 'JavaScript'],
  },

  // GenAI Topics
  {
    id: 'topic-genai-rag-pipeline',
    categoryId: 'genai',
    subjectId: 'genai-rag',
    name: 'Production RAG Architecture & Vector Search',
    slug: 'production-rag-vector-search',
    description: 'Chunking strategies, embedding drift, dense vs sparse retrieval, and cross-encoder rerankers.',
    difficulty: 'advanced',
    estimatedMinutes: 50,
    questionCount: 3,
    tags: ['GenAI', 'RAG', 'Vector DB', 'Embeddings', 'LLM'],
  },
  {
    id: 'topic-genai-mcp-agents',
    categoryId: 'genai',
    subjectId: 'genai-agents',
    name: 'AI Agent Architectures & Model Context Protocol (MCP)',
    slug: 'ai-agents-mcp-architecture',
    description: 'Tool use protocols, structured outputs, JSON schemas, loop safety, and agent memory state.',
    difficulty: 'expert',
    estimatedMinutes: 55,
    questionCount: 3,
    tags: ['GenAI', 'MCP', 'AI Agents', 'Tool Calling', 'Architecture'],
  },

  // Architecture Topics
  {
    id: 'topic-arch-event-driven',
    categoryId: 'architecture',
    subjectId: 'arch-sysdesign',
    name: 'Event-Driven Systems & Distributed Transactions (Saga)',
    slug: 'event-driven-saga-pattern',
    description: 'Kafka/RabbitMQ event streams, choreography vs orchestration sagas, and idempotency keys.',
    difficulty: 'expert',
    estimatedMinutes: 60,
    questionCount: 3,
    tags: ['System Design', 'Microservices', 'Kafka', 'Saga', 'Idempotency'],
  },
];

export const QUESTIONS: Question[] = [
  // Question 1: Python GIL
  {
    id: 'q-py-gil-01',
    title: 'Explain the Global Interpreter Lock (GIL) in CPython and How to Achieve True Parallelism',
    slug: 'cpython-global-interpreter-lock-parallelism',
    categoryId: 'python',
    subjectId: 'py-memory',
    topicId: 'topic-py-gil',
    minExperienceYears: 2,
    maxExperienceYears: 15,
    difficulty: 'advanced',
    interviewType: 'screening',
    estimatedTimeMinutes: 15,
    expectedAnswerDepth: 'Detailed architectural walkthrough of CPython reference counting, bytecode evaluation loop, and concurrency alternatives.',
    statement: 'What is the Global Interpreter Lock (GIL) in CPython, why does it exist, and how does it affect CPU-bound versus I/O-bound multi-threaded programs? How can a high-throughput Python service achieve true multicore parallelism?',
    shortAnswer: 'The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing CPython bytecodes at once. It exists primarily because CPython’s memory management uses non-thread-safe reference counting. For I/O-bound tasks, threads release the GIL while waiting on sockets/disk, making threading effective. For CPU-bound tasks, threads thrash on GIL contention, so multicore parallelism requires multiprocessing, process pools, native C/Rust extensions (which release the GIL), or Python 3.13+ free-threaded builds (PEP 703).',
    detailedExplanation: `### Why the GIL Exists in CPython
CPython tracks object lifecycles using reference counting supplemented by a cyclic garbage collector. Every time an object is referenced, its internal \`ob_refcnt\` field increments. Without a global lock, concurrent threads updating reference counts across shared objects would trigger race conditions and memory corruption.

### I/O-bound vs CPU-bound Behavior
1. **I/O-Bound Workloads:** When a thread initiates network or disk I/O (via OS system calls like \`select\`, \`poll\`, \`recv\`), it explicitly releases the GIL using the \`Py_BEGIN_ALLOW_THREADS\` macro. Another Python thread can execute while the first waits on the OS kernel. Threading or \`asyncio\` works wonderfully here.
2. **CPU-Bound Workloads:** Multiple threads contending for bytecode execution constantly fight for the GIL. On modern multicore OSes, this causes priority inversion and high CPU overhead ("the convoy effect") due to context switches without throughput gains.

### Strategies for Multicore Scalability
- **\`multiprocessing\` & Process Pools:** Separate OS processes each possess an independent Python interpreter, memory space, and GIL. Inter-Process Communication (IPC) uses OS pipes, shared memory (\`multiprocessing.shared_memory\`), or serialization (pickle).
- **C/C++/Rust Extensions:** Custom extensions or libraries like NumPy, PyTorch, and Polars drop the GIL during heavy numerical computations using \`Py_BEGIN_ALLOW_THREADS\`.
- **PEP 703 (Free-threaded Python 3.13+):** CPython now provides an experimental build where the GIL is disabled, replacing reference counts with mimalloc and biased reference counting.`,
    practicalExample: `Consider an image processing service:
Running 4 threads resizing images in pure Python runs slower than 1 single thread due to GIL contention.
Converting the service to \`concurrent.futures.ProcessPoolExecutor(max_workers=os.cpu_count())\` scales throughput linearly across all physical CPU cores.`,
    pythonCode: `import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def cpu_heavy_task(n: int) -> int:
    """Simulate intense CPU arithmetic."""
    count = 0
    for i in range(n):
        count += i * i
    return count

if __name__ == "__main__":
    nums = [10_000_000] * 4

    # 1. ThreadPool (Bounded by GIL on CPU tasks)
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_heavy_task, nums))
    print(f"Threads (GIL-bound) duration: {time.perf_counter() - start:.2f}s")

    # 2. ProcessPool (Bypasses GIL - runs on 4 physical cores)
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_heavy_task, nums))
    print(f"Processes (True parallel) duration: {time.perf_counter() - start:.2f}s")`,
    javaCode: `// Contrast with Java: Java threads map 1:1 to OS native threads with NO GIL!
import java.util.concurrent.*;
import java.util.stream.*;

public class ParallelComputation {
    public static long cpuHeavyTask(long n) {
        long sum = 0;
        for (long i = 0; i < n; i++) {
            sum += i * i;
        }
        return sum;
    }

    public static void main(String[] args) {
        long[] inputs = {10_000_000L, 10_000_000L, 10_000_000L, 10_000_000L};
        
        long start = System.currentTimeMillis();
        // Java parallel streams leverage ForkJoinPool across all cores natively
        LongStream.of(inputs).parallel().map(ParallelComputation::cpuHeavyTask).toArray();
        long elapsed = System.currentTimeMillis() - start;
        System.out.println("Java parallel stream across CPU cores: " + elapsed + "ms");
    }
}`,
    timeComplexity: 'O(N) CPU operations distributed across P processes -> O(N / P) wall-clock time.',
    spaceComplexity: 'O(P * M) where M is process base footprint; IPC shared memory reduces overhead.',
    commonMistakes: [
      'Assuming Python threading makes mathematical loops or image manipulation faster.',
      'Forgetting that multiprocessing copies data unless using shared memory or memory-mapped files.',
      'Unintentionally using global variables across processes without synchronization mechanisms like locks or managers.',
    ],
    followUpQuestions: [
      'How does Python 3.13 PEP 703 eliminate the GIL without degrading single-threaded performance?',
      'How does the cyclic garbage collector detect reference cycles that reference counting misses?',
      'When would you choose multiprocessing over asyncio in a high-throughput microservice?',
    ],
    experienceExpectations: {
      junior: 'Understands that Python has a GIL that restricts multiple threads from executing simultaneously.',
      mid: 'Explains the difference between CPU-bound and I/O-bound workloads and demonstrates ProcessPoolExecutor usage.',
      senior: 'Discusses CPython reference counting internals, GIL release in C extensions, IPC serialization costs, and shared memory.',
      staffOrLead: 'Compares PEP 703 biased reference counting with JVM OS-thread concurrency, evaluating architectural trade-offs for distributed microservices.',
    },
    prerequisites: ['Python basics', 'Threads vs Processes', 'OS context switching'],
    tags: ['Python', 'GIL', 'CPython', 'Concurrency', 'Memory Management'],
    codePlayground: {
      starterPython: `def calculate_parallel_factors(numbers: list[int]) -> list[int]:
    # TODO: Write an efficient implementation that handles large integers
    results = []
    for n in numbers:
        factors = sum(1 for i in range(1, int(n**0.5) + 1) if n % i == 0)
        results.append(factors)
    return results

# Test run
print(calculate_parallel_factors([1000000, 2000000, 3000000]))`,
      starterJava: `import java.util.*;

public class Solution {
    public static List<Integer> calculateFactors(List<Integer> numbers) {
        // TODO: Implement solution
        List<Integer> results = new ArrayList<>();
        for (int n : numbers) {
            int count = 0;
            for (int i = 1; i <= Math.sqrt(n); i++) {
                if (n % i == 0) count += (i * i == n) ? 1 : 2;
            }
            results.add(count);
        }
        return results;
    }

    public static void main(String[] args) {
        System.out.println(calculateFactors(Arrays.asList(100, 200, 300)));
    }
}`,
      solutionPython: `def calculate_parallel_factors(numbers: list[int]) -> list[int]:
    results = []
    for n in numbers:
        count = 0
        limit = int(n**0.5)
        for i in range(1, limit + 1):
            if n % i == 0:
                count += 1 if i * i == n else 2
        results.append(count)
    return results`,
      solutionJava: `import java.util.*;
import java.util.stream.Collectors;

public class Solution {
    public static List<Integer> calculateFactors(List<Integer> numbers) {
        return numbers.parallelStream().map(n -> {
            int count = 0;
            int limit = (int) Math.sqrt(n);
            for (int i = 1; i <= limit; i++) {
                if (n % i == 0) count += (i * i == n) ? 1 : 2;
            }
            return count;
        }).collect(Collectors.toList());
    }
}`,
      testCases: [
        { input: '[100, 25, 12]', expected: '[9, 3, 6]', description: 'Small composite numbers' },
        { input: '[13, 17, 19]', expected: '[2, 2, 2]', description: 'Prime numbers have exactly 2 factors' },
      ],
      hints: [
        'Iterate up to sqrt(n) rather than n to achieve O(sqrt(N)) factor checks.',
        'If i * i == n, count only 1; otherwise count 2 factors (i and n // i).',
      ],
      complexityAnalysis: {
        time: 'O(K * sqrt(N)) where K is count of numbers and N is magnitude of number.',
        space: 'O(K) to store results.',
        explanation: 'Testing divisors only up to the square root avoids redundant operations.',
      },
    },
    status: 'published',
  },

  // Question 2: Java JVM Memory & GC
  {
    id: 'q-java-jvm-01',
    title: 'JVM Memory Model: Generational Heap, Garbage Collectors (G1 vs ZGC), and Metaspace',
    slug: 'jvm-memory-model-generational-heap-g1-zgc-metaspace',
    categoryId: 'java',
    subjectId: 'java-core',
    topicId: 'topic-java-jvm-memory',
    minExperienceYears: 2,
    maxExperienceYears: 20,
    difficulty: 'advanced',
    interviewType: 'screening',
    estimatedTimeMinutes: 20,
    expectedAnswerDepth: 'Clear breakdown of Eden, Survivor (S0/S1), Tenured (Old), Metaspace, and tuning parameters for modern low-latency GC.',
    statement: 'Describe the JVM memory layout under the HotSpot virtual machine. How does Generational Garbage Collection work? Compare the G1 Garbage Collector with ZGC regarding pause times, throughput, and heap sizes.',
    shortAnswer: 'The JVM heap is split into Young Generation (Eden, Survivor S0 & S1) and Old Generation (Tenured), while class metadata resides off-heap in Metaspace. Most objects die young (Weak Generational Hypothesis), so Minor GCs scavenge Eden quickly using copying collectors. Survived objects promote to Old Generation. G1GC divides the heap into equal-sized regions and targets a predictable pause time (default 200ms) by collecting highest-garbage regions first. ZGC is a concurrent, low-latency collector using colored pointers and load barriers, ensuring sub-millisecond pause times regardless of multi-terabyte heap sizes at a slight throughput cost.',
    detailedExplanation: `### JVM Memory Architecture
1. **Young Generation:**
   - **Eden:** Newly allocated objects arrive here via TLABs (Thread Local Allocation Buffers).
   - **Survivor Spaces (S0 / From, S1 / To):** Objects surviving a minor collection copy between S0 and S1 while age counters increment. Once tenure threshold (default 15) is met, they promote.
2. **Old Generation (Tenured):** Long-lived singletons, cache entries, and session pools live here. Major/Full GC sweeps this area.
3. **Metaspace (Java 8+):** Stores class definitions, runtime constant pools, and method bytecode in native OS virtual memory (replacing the old fixed PermGen).

### Comparing G1GC vs ZGC
| Feature | G1 (Garbage-First) | ZGC (Z Garbage Collector) |
|---|---|---|
| Heap Layout | Uniform regions (1MB to 32MB) | Page-based regions (small, medium, large) |
| Target Pause Time | Configurable target (\`-XX:MaxGCPauseMillis=200\`) | Sub-millisecond (< 1ms) guaranteed |
| Concurrency | Concurrent marking; Stop-The-World copying/evacuation | Fully concurrent marking & relocation (evacuation) |
| Mechanism | Remembered Sets (RSet), Card tables | Colored pointers (4 metadata bits) + Load barriers |
| Best For | Balanced throughput and predictable pause times | Massive low-latency heaps (8GB to 16TB+) |`,
    practicalExample: `In a financial order matching engine, a 50ms G1GC Stop-The-World pause can violate SLA agreements. Switching JVM flags to \`-XX:+UseZGC -XX:ZAllocationSpikeTolerance=5\` reduces 99.9th percentile GC pause times to under 0.5ms.`,
    pythonCode: `# Contrast with Python Memory Management:
# Python uses pymalloc (arenas, pools, blocks) + reference counts + 3-generation cyclic GC:
import gc

print(f"Python GC generational thresholds: {gc.get_threshold()}")
# Default: (700, 10, 10)
# Gen 0 runs every 700 net allocations; Gen 1 every 10 Gen 0 runs; Gen 2 every 10 Gen 1 runs.`,
    javaCode: `// Java JVM runtime inspection:
public class JvmMemoryInspection {
    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();       // -Xmx
        long totalMemory = runtime.totalMemory();   // currently allocated heap
        long freeMemory = runtime.freeMemory();     // free in currently allocated

        System.out.println("Max Heap (-Xmx): " + (maxMemory / (1024 * 1024)) + " MB");
        System.out.println("Allocated Heap:   " + (totalMemory / (1024 * 1024)) + " MB");
        System.out.println("Free Heap:        " + (freeMemory / (1024 * 1024)) + " MB");
    }
}`,
    timeComplexity: 'Minor GC: O(live objects in Eden). Full GC: O(entire heap). ZGC pause: O(root set scan) ~ O(1).',
    spaceComplexity: 'ZGC colored pointers use 4 bits in 64-bit addresses, requiring 64-bit OS platforms.',
    commonMistakes: [
      'Invoking System.gc() in production code, which triggers full stop-the-world STW sweeps.',
      'Allowing Metaspace to leak via dynamic proxy generation or classloader churn without setting -XX:MaxMetaspaceSize.',
      'Assuming larger heaps always fix OutOfMemoryErrors when the root cause is an uncleaned static HashMap cache.',
    ],
    followUpQuestions: [
      'What is the difference between shallow heap size and retained heap size in heap dumps?',
      'How does ZGC handle pointer relocation without pausing application threads?',
      'How would you diagnose a memory leak where Old Generation steadily climbs to 100%?',
    ],
    experienceExpectations: {
      junior: 'Distinguishes between Stack and Heap and knows what Garbage Collection does.',
      mid: 'Explains Young vs Old generation, Eden/Survivor copying, and mentions G1GC basics.',
      senior: 'Details write barriers, card tables, remembered sets, and analyzes GC logs with tools like GCViewer or VisualVM.',
      staffOrLead: 'Compares ZGC and Shenandoah load barriers, explains generational ZGC (Java 21), and designs zero-allocation systems.',
    },
    prerequisites: ['Java fundamentals', 'Operating system memory concepts'],
    tags: ['Java', 'JVM', 'Garbage Collection', 'G1GC', 'ZGC', 'Performance Tuning'],
    status: 'published',
  },

  // Question 3: DSA Sliding Window
  {
    id: 'q-dsa-sliding-01',
    title: 'Longest Substring Without Repeating Characters (Optimal Sliding Window)',
    slug: 'longest-substring-without-repeating-characters',
    categoryId: 'dsa',
    subjectId: 'dsa-arrays',
    topicId: 'topic-dsa-sliding-window',
    minExperienceYears: 0,
    maxExperienceYears: 10,
    difficulty: 'intermediate',
    interviewType: 'coding',
    estimatedTimeMinutes: 20,
    expectedAnswerDepth: 'Derive from O(N^2) brute force to O(N) sliding window with hash map storing last seen index.',
    statement: 'Given a string `s`, find the length of the longest substring without duplicate characters. Provide optimal solutions in Python and Java, analyzing time and space complexity.',
    shortAnswer: 'Maintain a dynamic sliding window `[left, right]`. Use a hash map storing each character’s most recent index. When a duplicate character is encountered within the current window, move the left pointer forward past the duplicate index (`left = max(left, last_seen[char] + 1)`). Update the character’s position and compute `max_len = max(max_len, right - left + 1)`. This runs in O(N) time and O(min(N, charset)) space.',
    detailedExplanation: `### Algorithm Walkthrough
1. **Pointers:** Initialize \`left = 0\` and \`max_length = 0\`.
2. **Hash Table:** Keep a dictionary or array mapping \`char -> last_seen_index\`.
3. **Scan:** Iterate \`right\` pointer from 0 to \`len(s) - 1\`:
   - If \`char\` is in table and its recorded index is \`>= left\`, a collision occurs within the active window. Move \`left = table[char] + 1\`.
   - Record current index: \`table[char] = right\`.
   - Update answer: \`max_length = max(max_length, right - left + 1)\`.

By skipping \`left\` directly past the earlier occurrence rather than incrementing one by one, each character is inspected once.`,
    practicalExample: `Input: s = "abcabcbb"
- Window expands: "a" (len 1), "ab" (len 2), "abc" (len 3)
- Encounter second 'a' at idx 3: previous 'a' was at 0, move left to 1. Window becomes "bca" (len 3).
- Output: 3 (substring "abc").`,
    pythonCode: `def length_of_longest_substring(s: str) -> int:
    """Find longest substring without repeating characters in O(N) time."""
    char_index_map: dict[str, int] = {}
    left = 0
    max_len = 0

    for right, char in enumerate(s):
        if char in char_index_map and char_index_map[char] >= left:
            left = char_index_map[char] + 1
        
        char_index_map[char] = right
        max_len = max(max_len, right - left + 1)

    return max_len

# Tests
assert length_of_longest_substring("abcabcbb") == 3
assert length_of_longest_substring("bbbbb") == 1
assert length_of_longest_substring("pwwkew") == 3`,
    javaCode: `import java.util.HashMap;
import java.util.Map;

public class LongestSubstring {
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> charIndexMap = new HashMap<>();
        int left = 0;
        int maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (charIndexMap.containsKey(c) && charIndexMap.get(c) >= left) {
                left = charIndexMap.get(c) + 1;
            }
            charIndexMap.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println(lengthOfLongestSubstring("bbbbb"));    // 1
        System.out.println(lengthOfLongestSubstring("pwwkew"));   // 3
    }
}`,
    timeComplexity: 'O(N) where N is the length of string s. The right pointer iterates N times, and left moves strictly forward.',
    spaceComplexity: 'O(min(N, Sigma)) where Sigma is the character set size (e.g. 26 lowercase English letters or 128 ASCII).',
    commonMistakes: [
      'Forgetting the condition `char_index_map[char] >= left`, causing `left` to jump backwards to an old index outside the current window.',
      'Using a set with while-loop deletes, which works (O(2N)) but performs more operations than direct index skipping.',
      'Failing on empty string input (`""`) which should return 0.',
    ],
    followUpQuestions: [
      'What if the input contains full UTF-8 emojis and multi-byte runes?',
      'How would you return the actual substring instead of just its length?',
      'How would you solve the problem if up to K repeating characters were allowed?',
    ],
    experienceExpectations: {
      junior: 'Can code the sliding window with a set in O(2N) after hints.',
      mid: 'Writes clean O(N) hash map solution with proper edge case handling (empty strings, all identical chars).',
      senior: 'Optimizes space by using fixed ASCII array \`int[128]\` instead of HashMap for zero memory allocations.',
      staffOrLead: 'Discusses cache locality of primitive arrays vs object maps and streaming variations on infinite strings.',
    },
    prerequisites: ['Hash maps', 'Two pointer concept', 'String indexing'],
    tags: ['DSA', 'Arrays', 'Strings', 'Sliding Window', 'Two Pointers'],
    codePlayground: {
      starterPython: `def length_of_longest_substring(s: str) -> int:
    # Your code here:
    pass

print(length_of_longest_substring("abcabcbb"))`,
      starterJava: `public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        // Your code here:
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb"));
    }
}`,
      solutionPython: `def length_of_longest_substring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, c in enumerate(s):
        if c in char_map and char_map[c] >= left:
            left = char_map[c] + 1
        char_map[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      solutionJava: `import java.util.HashMap;

public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      testCases: [
        { input: '"abcabcbb"', expected: '3', description: 'Standard mixed characters' },
        { input: '"bbbbb"', expected: '1', description: 'All duplicate characters' },
        { input: '"pwwkew"', expected: '3', description: 'Repeated letters with overlapping window' },
        { input: '""', expected: '0', description: 'Empty string edge case' },
      ],
      hints: [
        'Use two pointers to represent the current substring window.',
        'Store the character index in a hash map so you can jump the left pointer directly.',
      ],
      complexityAnalysis: {
        time: 'O(N) single-pass scan.',
        space: 'O(min(N, charset size)) for the hash map.',
        explanation: 'Each character is visited at most twice (by right pointer and indexed directly).',
      },
    },
    status: 'published',
  },

  // Question 4: Systems Stack vs Heap
  {
    id: 'q-sys-memory-01',
    title: 'Stack vs Heap Memory: Allocation Mechanisms, Cache Locality & Memory Leaks',
    slug: 'stack-vs-heap-memory-allocation-cache-locality',
    categoryId: 'systems',
    subjectId: 'sys-memory',
    topicId: 'topic-sys-stack-heap',
    minExperienceYears: 0,
    maxExperienceYears: 12,
    difficulty: 'intermediate',
    interviewType: 'screening',
    estimatedTimeMinutes: 15,
    expectedAnswerDepth: 'Contrast hardware stack pointer increment vs OS/runtime heap allocator, CPU cache lines (L1/L2), and lifecycle management.',
    statement: 'How do stack memory and heap memory differ at the architectural and operating system levels? Why is stack allocation significantly faster than heap allocation, and how does cache locality impact performance?',
    shortAnswer: 'Stack memory is contiguous, thread-private, and managed by CPU stack pointer adjustments (push/pop in O(1)). Stack frames hold local primitives, call parameters, and return addresses, freeing automatically when functions return. Heap memory is shared, fragmented, and dynamically allocated at runtime via allocator algorithms (e.g. malloc, tcmalloc, jemalloc, JVM/Python runtimes) involving lock contention, free-list searches, and garbage collection. Stack memory enjoys superior CPU L1/L2 cache locality due to strict spatial proximity, whereas heap pointers cause pointer chasing and cache misses.',
    detailedExplanation: `### Architectural Comparison
| Characteristic | Stack Memory | Heap Memory |
|---|---|---|
| Allocation Speed | Microscopic (single CPU instruction adjusting \`RSP\`) | Slower (search free-list, lock heap, possible OS \`mmap\`/\`brk\`) |
| Thread Safety | Inherently thread-safe (each thread has private stack) | Shared across threads (requires synchronization/locks) |
| Size Limit | Fixed & modest (typically 1MB - 8MB); overflows trigger StackOverflowError | Bounded by available RAM and virtual memory address space |
| Fragmentation | Zero fragmentation (strictly LIFO order) | High internal & external fragmentation over time |
| Cache Locality | Exceptional (frequently residing in L1 data cache) | Variable; following heap references incurs cache misses |

### Why Cache Locality Matters
Modern CPUs access L1 cache in ~1ns, whereas main memory access requires ~50-100ns (50x-100x slower). Contiguous stack allocations mean memory is prefetched and stays in cache lines (64 bytes). Heap-allocated objects scattered across RAM require frequent page table walks and cache line evictions.`,
    practicalExample: `In high-performance gaming or high-frequency trading:
Allocating 1,000,000 small structs on the heap via separate \`new\` calls causes millions of fragmented pointer dereferences.
Storing them contiguously in a pre-allocated stack-allocated buffer or contiguous array achieves a 10x-30x speedup due to vectorization and CPU hardware prefetchers.`,
    pythonCode: `# Python stack vs heap perspective:
# In Python, almost EVERYTHING is an object on the heap!
# Even integers are PyObject structs with ob_refcnt allocated on the heap:
import sys

x = 42
print(f"Size of integer 42 on heap: {sys.getsizeof(x)} bytes")
# Notice that x is a 28-byte heap object, not a raw 4-byte machine integer!`,
    javaCode: `// Java primitive on stack vs object on heap:
public class StackHeapDemo {
    public void execute() {
        int primitiveStack = 42; // Allocated directly inside current thread's stack frame

        // Object reference resides on the stack, but the Object instance lives on the Heap
        String heapObject = new String("DevPath");
    }
}`,
    timeComplexity: 'Stack alloc: O(1) instruction. Heap alloc: O(1) amortized with pool allocators, but O(N) when coalescing free chunks.',
    spaceComplexity: 'Stack: O(Call Depth * Frame Size). Heap: Dynamic O(Total Live Objects).',
    commonMistakes: [
      'Assuming stack memory persists after a function returns (leads to dangling pointers in C/C++).',
      'Thinking memory leaks only occur in languages without garbage collectors (e.g., retaining unused object roots in Java/Python prevents GC).',
    ],
    followUpQuestions: [
      'What is escape analysis in the JVM, and how does it scalar-replace heap allocations onto the stack?',
      'What causes a StackOverflowError vs an OutOfMemoryError?',
    ],
    experienceExpectations: {
      junior: 'Can describe Stack as fast LIFO for local variables and Heap as flexible area for objects.',
      mid: 'Explains allocation speed differences, thread stacks, and memory fragmentation.',
      senior: 'Analyzes CPU L1/L2 cache lines, TLB misses, and JVM escape analysis optimization.',
      staffOrLead: 'Discusses NUMA architecture, custom memory arenas, off-heap buffers, and zero-copy networking.',
    },
    prerequisites: ['Computer architecture basics', 'Pointers and references'],
    tags: ['Systems', 'Memory', 'Stack', 'Heap', 'CPU Cache', 'Performance'],
    status: 'published',
  },

  // Question 5: React Fiber & Reconciliation
  {
    id: 'q-react-fiber-01',
    title: 'React Fiber Architecture, Virtual DOM Reconciliation & Batching Updates',
    slug: 'react-fiber-architecture-reconciliation-batching',
    categoryId: 'fullstack',
    subjectId: 'fs-frontend',
    topicId: 'topic-fs-react-reconciliation',
    minExperienceYears: 2,
    maxExperienceYears: 15,
    difficulty: 'advanced',
    interviewType: 'screening',
    estimatedTimeMinutes: 20,
    expectedAnswerDepth: 'Detailed discussion of Fiber nodes (linked list structure), render phase vs commit phase, time slicing, and React 18 automatic batching.',
    statement: 'What is React Fiber, what problems did it solve over the legacy stack reconciler, and how does the reconciliation algorithm compute minimal DOM mutations? How does React 18 automatic batching work?',
    shortAnswer: 'The legacy React stack reconciler was recursive and synchronous; once rendering started on a large tree, it blocked the main JavaScript thread, dropping animation frames and causing input lag. React Fiber re-architected the Virtual DOM into a cooperative linked list of Fiber nodes (`child`, `sibling`, `return`). This enables incremental rendering, interruptible work (time-slicing via `requestIdleCallback`/scheduler), and prioritization. Reconciliation operates in two phases: the interruptible Render phase (diffing fibers to generate effect tags) and the synchronous Commit phase (applying DOM updates). React 18 introduces automatic batching across promises, timeouts, and native handlers.',
    detailedExplanation: `### The Fiber Data Structure
A Fiber is a plain JavaScript object representing a unit of work. Each fiber holds:
- \`child\`: Pointer to first child fiber
- \`sibling\`: Pointer to next sibling fiber
- \`return\`: Pointer to parent fiber (for bubbling back up)
- \`memoizedState\`: Linked list of hook states
- \`flags\`: Mutation, placement, deletion tags

### The Two Phases of Fiber Reconciliation
1. **Render Phase (Concurrent & Interruptible):**
   - React constructs a new work-in-progress fiber tree using double buffering.
   - If user input occurs (e.g. typing), React can pause or abort low-priority rendering.
   - Pure, idempotent work — NO DOM mutations occur here.
2. **Commit Phase (Synchronous & Non-interruptible):**
   - React takes the finished work-in-progress tree and commits DOM insertions, deletions, and updates in one rapid sweep.
   - Runs \`useLayoutEffect\` synchronously, updates refs, then runs \`useEffect\` asynchronously.

### React 18 Automatic Batching
Prior to React 18, state updates inside \`setTimeout\` or \`fetch().then()\` triggered separate renders. React 18 batches all state updates within microtask queues by default, dramatically reducing re-renders.`,
    practicalExample: `In a search dropdown typing 100 items:
Without Fiber, each keystroke freezes the UI while 100 items render.
With Fiber & \`useDeferredValue\` or \`useTransition\`, React marks input typing as Urgent priority and dropdown filtering as Low priority, keeping typing at 60 FPS while background rendering computes.`,
    pythonCode: `# Contrast with backend frameworks:
# Backend templates (Django/Jinja) render whole HTML strings synchronously.
# FastAPI returns JSON, delegating client-side reconciliation entirely to the frontend bundle.`,
    javaCode: `// Contrast with Java desktop frameworks:
// Java Swing / JavaFX uses an Event Dispatch Thread (EDT).
// Long operations must use SwingWorker to avoid freezing the UI thread,
// analogous to React Fiber's cooperative time-slicing.`,
    timeComplexity: 'Reconciliation heuristic: O(N) linear time compared to general O(N^3) tree diffing algorithms.',
    spaceComplexity: 'O(N) where N is the number of component nodes (double buffering keeps two trees: current and work-in-progress).',
    commonMistakes: [
      'Using array index as React key in dynamic lists (breaks Fiber re-association and causes state corruption).',
      'Triggering side-effects inside the render phase (e.g. calling APIs directly in component body), which runs multiple times under concurrent mode.',
    ],
    followUpQuestions: [
      'Why is the commit phase synchronous while the render phase is concurrent?',
      'How does React key heuristic allow O(N) tree diffing instead of general O(N^3)?',
      'What is the difference between useTransition and useDeferredValue?',
    ],
    experienceExpectations: {
      junior: 'Understands Virtual DOM and knows why keys are needed in lists.',
      mid: 'Explains component re-rendering triggers, memoization (useMemo/useCallback), and mentions Fiber phases.',
      senior: 'Details Fiber linked list traversal (child, sibling, return), double buffering, and React 18 concurrent scheduling.',
      staffOrLead: 'Analyzes scheduler priority levels (Immediate, UserBlocking, Normal, Low, Idle) and evaluates RSC streaming architecture.',
    },
    prerequisites: ['React basics', 'JavaScript event loop', 'DOM mechanics'],
    tags: ['Full Stack', 'React', 'Frontend', 'Virtual DOM', 'Reconciliation', 'Architecture'],
    status: 'published',
  },

  // Question 6: GenAI RAG Architecture
  {
    id: 'q-genai-rag-01',
    title: 'Production RAG Architecture: Chunking, Hybrid Search, Vector Embeddings & Reranking',
    slug: 'production-rag-chunking-hybrid-search-reranking',
    categoryId: 'genai',
    subjectId: 'genai-rag',
    topicId: 'topic-genai-rag-pipeline',
    minExperienceYears: 2,
    maxExperienceYears: 18,
    difficulty: 'advanced',
    interviewType: 'system_design',
    estimatedTimeMinutes: 25,
    expectedAnswerDepth: 'End-to-end design covering document ingestion, semantic chunking, dense vector retrieval vs sparse BM25, cross-encoder rerankers, and hallucination guardrails.',
    statement: 'How do you design an enterprise-grade Retrieval-Augmented Generation (RAG) system for a knowledge base of 500,000 technical manuals? How do you overcome context loss from chunking, semantic retrieval misses, and LLM hallucinations?',
    shortAnswer: 'A production RAG architecture requires a multi-stage pipeline: (1) Ingestion with semantic/recursive chunking preserving document hierarchy and metadata; (2) Multi-representation indexing pairing dense vector embeddings (e.g. text-embedding-3-large) with sparse keyword indexes (BM25); (3) Hybrid Search with Reciprocal Rank Fusion (RRF); (4) Cross-Encoder Reranking (e.g. Cohere or BGE-Reranker) on top 50 candidates; (5) Context compression/prompt assembly with citation constraints; and (6) Post-generation validation via fact-checking guardrails (e.g. Ragas faithfulness checks).',
    detailedExplanation: `### The 5 Architectural Stages of Enterprise RAG

\`\`\`
User Query
   │
   ▼
Query Transformation (Hypothetical Document Embedding / Multi-Query)
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
Dense Vector Retrieval (HNSW)   Sparse Keyword (BM25)     Metadata Filter (Tenant/Date)
   │                              │                              │
   └──────────────────────────────┴──────────────────────────────┘
                                  │
                                  ▼
                  Reciprocal Rank Fusion (RRF) -> Top 50 Chunks
                                  │
                                  ▼
                  Cross-Encoder Reranker (Top 5-10 Chunks)
                                  │
                                  ▼
                  LLM Prompt Assembly with Grounded Citations
                                  │
                                  ▼
                  Streaming LLM Response + Faithfulness Guardrail
\`\`\`

### Solving Common RAG Failures
1. **Chunk Boundary Loss:** Use parent-child chunking (retrieve small 200-token chunks for precision match, feed large 1000-token parent to LLM) or sentence-window retrieval.
2. **Keyword vs Semantic Misses:** Pure vector search fails on acronyms, part numbers, or exact product codes. Combining BM25 with vector search (Hybrid Search) ensures both semantic and exact keyword coverage.
3. **Lost in the Middle:** Place the most relevant retrieved chunks at the very beginning and very end of the prompt context window.
4. **Hallucinations:** Instruct LLM to cite document UUIDs for each assertion, returning "Insufficient information in provided sources" if unverified.`,
    practicalExample: `In a medical diagnostics portal:
A user asks: "What is the dosage of Drug-X for pediatric patient with renal failure?"
Dense embeddings alone confuse "renal failure" with general kidney conditions. Hybrid BM25 enforces the exact match "Drug-X", and a reranker prioritizes the pediatric renal dosage table at rank #1.`,
    pythonCode: `# Production hybrid search scoring simulation:
def reciprocal_rank_fusion(dense_ranks: dict[str, int], sparse_ranks: dict[str, int], k: int = 60) -> list[tuple[str, float]]:
    """Combine dense vector ranks and sparse BM25 ranks using RRF."""
    scores: dict[str, float] = {}
    
    all_doc_ids = set(dense_ranks.keys()) | set(sparse_ranks.keys())
    for doc_id in all_doc_ids:
        dense_score = 1.0 / (k + dense_ranks.get(doc_id, 1000))
        sparse_score = 1.0 / (k + sparse_ranks.get(doc_id, 1000))
        scores[doc_id] = dense_score + sparse_score

    # Sort descending by score
    return sorted(scores.items(), key=lambda item: item[1], reverse=True)

# Example:
dense = {"doc_101": 1, "doc_204": 2, "doc_305": 3}
sparse = {"doc_204": 1, "doc_999": 2, "doc_101": 3}
ranked = reciprocal_rank_fusion(dense, sparse)
print(f"Top RRF candidate: {ranked[0]}")  # doc_204 ranks #1 due to high consensus!`,
    javaCode: `// Java implementation of RRF score calculation:
import java.util.*;

public class HybridRRF {
    public static Map<String, Double> calculateRRF(Map<String, Integer> dense, Map<String, Integer> sparse, int k) {
        Map<String, Double> scores = new HashMap<>();
        Set<String> allDocs = new HashSet<>(dense.keySet());
        allDocs.addAll(sparse.keySet());

        for (String id : allDocs) {
            double sDense = 1.0 / (k + dense.getOrDefault(id, 1000));
            double sSparse = 1.0 / (k + sparse.getOrDefault(id, 1000));
            scores.put(id, sDense + sSparse);
        }
        return scores;
    }
}`,
    timeComplexity: 'HNSW vector search: O(log N). BM25: O(query length). Cross-encoder: O(K * SeqLen^2) on top K=50 candidates.',
    spaceComplexity: 'Vector index: ~4 bytes * dimensions * N vectors (e.g. 1536 dims * 500k docs ~ 3GB in RAM).',
    commonMistakes: [
      'Sending too many chunks (e.g. 40 chunks) directly into the prompt without reranking, overflowing context and causing hallucinations.',
      'Using naive fixed-character chunking (e.g. every 500 characters) which splits sentences and tables in half.',
      'Omitting metadata filtering (e.g. tenant_id, date, ACL permissions), risking cross-tenant data leaks.',
    ],
    followUpQuestions: [
      'How does GraphRAG (Knowledge Graph augmented RAG) outperform traditional vector RAG on multi-hop questions?',
      'How do you handle embedding model drift when upgrading to a newer embedding version without re-indexing 500k documents?',
      'What metrics (Faithfulness, Answer Relevance, Context Precision) do you track in continuous RAG evaluation?',
    ],
    experienceExpectations: {
      junior: 'Explains basic vector search with OpenAI embeddings and cosine similarity.',
      mid: 'Designs a basic LangChain/LlamaIndex pipeline with chunking and Pinecone/pgvector.',
      senior: 'Designs end-to-end hybrid retrieval, cross-encoder reranking, parent-child chunking, and latency optimization.',
      staffOrLead: 'Architects multi-tenant enterprise RAG with fine-grained RBAC, semantic caching, GraphRAG, and automated CI/CD evaluation suites.',
    },
    prerequisites: ['Vector embeddings', 'Information retrieval basics', 'Transformer attention'],
    tags: ['Generative AI', 'RAG', 'Vector Search', 'LLMs', 'System Design', 'Hybrid Search'],
    status: 'published',
  },

  // Question 7: System Design & Event-Driven Saga Pattern
  {
    id: 'q-arch-saga-01',
    title: 'Distributed Transactions: Saga Pattern, Outbox Pattern & Idempotency in Microservices',
    slug: 'distributed-transactions-saga-outbox-idempotency',
    categoryId: 'architecture',
    subjectId: 'arch-sysdesign',
    topicId: 'topic-arch-event-driven',
    minExperienceYears: 4,
    maxExperienceYears: 20,
    difficulty: 'expert',
    interviewType: 'system_design',
    estimatedTimeMinutes: 30,
    expectedAnswerDepth: 'Complete architectural trade-off between Two-Phase Commit (2PC) vs Choreographed/Orchestrated Saga, transactional outbox pattern, and idempotency guarantees.',
    statement: 'In an e-commerce platform transitioning from a monolith to microservices (Order, Inventory, Payment, Shipping), how do you ensure data consistency across services without blocking 2-Phase Commit (2PC)? How do you recover from payment failures mid-order, and how do you guarantee exactly-once processing across Kafka?',
    shortAnswer: '2-Phase Commit (2PC) introduces high latency, synchronous locks, and single-point-of-failure coordinators unsuited for distributed clouds. Instead, use the Saga Pattern: a sequence of local transactions where each service commits locally and publishes an event/message. If a step fails (e.g. Payment declined), the Saga executes compensating transactions in reverse order (e.g. release reserved inventory). To bridge DB writes and Kafka event publishing reliably without dual-write race conditions, use the Transactional Outbox Pattern with Debezium CDC. Idempotency keys stored with unique DB constraints guarantee at-least-once message delivery behaves as exactly-once processing.',
    detailedExplanation: `### Choreography vs Orchestration Saga
- **Choreography (Event-Driven):** Services listen to domain events and react autonomously. Suitable for simple workflows (3-4 steps). Risks: difficult to trace, circular event dependencies.
- **Orchestration (State Machine):** A dedicated Saga Orchestrator (e.g. Temporal, AWS Step Functions, or custom service) explicitly commands each participant: \`Execute Payment\`, wait for response, \`Reserve Stock\`. Highly observable and easier to manage rollbacks.

### The Transactional Outbox Pattern
Never write to PostgreSQL and publish to Kafka in two separate uncoordinated operations:
If DB succeeds but Kafka network times out, data becomes inconsistent.
**Solution:**
1. Inside a single local ACID transaction, write both the business entity (\`orders\`) and an event record into an \`outbox\` table.
2. An asynchronous worker or CDC engine (Debezium reading Postgres WAL) streams outbox records to Kafka with zero data loss.

### Compensating Transactions vs Rollbacks
In distributed systems, you cannot "abort" an already-committed local transaction. You must execute a compensating transaction (e.g. refunding money, restocking inventory) that logically reverses the business effect.`,
    practicalExample: `Checkout Flow:
1. Orchestrator -> Inventory: Reserve 2 items (Committed locally).
2. Orchestrator -> Payment: Charge $100 -> FAILS (Card expired).
3. Compensating Action: Orchestrator -> Inventory: Release reserved items.
4. Orchestrator -> Order: Mark Order as FAILED.`,
    pythonCode: `# Python representation of an Idempotent Event Consumer:
import hashlib

def process_payment_event(event_id: str, order_id: str, amount_cents: int, db_connection) -> bool:
    """Guarantee idempotency using a database constraint."""
    # Compute deterministic idempotency token
    token = hashlib.sha256(f"{event_id}:{order_id}".encode()).hexdigest()
    
    with db_connection.cursor() as cursor:
        # Check if already processed
        cursor.execute("SELECT status FROM processed_events WHERE idempotency_token = %s", (token,))
        if cursor.fetchone():
            print(f"Event {event_id} already processed. Skipping to maintain idempotency.")
            return True
            
        # Process payment logic...
        cursor.execute(
            "INSERT INTO processed_events (idempotency_token, order_id, processed_at) VALUES (%s, %s, NOW())",
            (token, order_id)
        )
    db_connection.commit()
    return True`,
    javaCode: `// Java Spring Boot Transactional Outbox Entity:
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false)
    private String aggregateType; // e.g., "ORDER"

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload; // JSON serialized domain event

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}`,
    timeComplexity: 'Async processing decoupled from user request: User receives PENDING order in < 100ms; Saga completes in background.',
    spaceComplexity: 'Outbox table requires TTL or retention pruning once CDC logs consume records.',
    commonMistakes: [
      'Assuming compensating transactions cannot fail (they must be idempotent and retried until successful).',
      'Publishing to Kafka before committing database transaction (consumers receive events for uncommitted data that might roll back).',
      'Neglecting semantic isolation (e.g. another user purchasing stock between reservation and payment failure).',
    ],
    followUpQuestions: [
      'How do you handle semantic lock anomalies when intermediate saga state is visible to users?',
      'Why does Kafka not provide true end-to-end exactly-once semantics without transactional producers and consumers?',
      'When would you still pick 2PC/XA transactions over a Saga?',
    ],
    experienceExpectations: {
      junior: 'Knows that microservices use separate databases and that network calls can fail.',
      mid: 'Explains what a Saga is and why distributed rollbacks require compensating actions.',
      senior: 'Designs Orchestration Sagas, the Outbox pattern with Debezium, and ensures consumer idempotency.',
      staffOrLead: 'Addresses distributed concurrency anomalies (lost updates, dirty reads), designs cross-datacenter failover, and enforces event governance across 50+ squads.',
    },
    prerequisites: ['Microservices fundamentals', 'ACID transactions', 'Message queues (Kafka/RabbitMQ)'],
    tags: ['Architecture', 'System Design', 'Microservices', 'Distributed Systems', 'Saga', 'Kafka'],
    status: 'published',
  },

  // Question 8: AI Agents & MCP Architecture
  {
    id: 'q-genai-mcp-01',
    title: 'AI Agent Architectures: ReAct Pattern, Function Calling & Model Context Protocol (MCP)',
    slug: 'ai-agents-react-pattern-model-context-protocol-mcp',
    categoryId: 'genai',
    subjectId: 'genai-agents',
    topicId: 'topic-genai-mcp-agents',
    minExperienceYears: 3,
    maxExperienceYears: 18,
    difficulty: 'expert',
    interviewType: 'system_design',
    estimatedTimeMinutes: 25,
    expectedAnswerDepth: 'Deep technical walkthrough of ReAct (Reason + Act) loop, tool calling protocols, Model Context Protocol (MCP) client-server architecture, and guardrails for autonomous agents.',
    statement: 'How do autonomous AI agents plan and execute multi-step tasks using tool calling? What is the Model Context Protocol (MCP), and how does it standardize agent-to-tool communication compared to proprietary API schemas?',
    shortAnswer: 'AI agents operate via an iterative loop (such as ReAct: Thought -> Action -> Observation). Instead of only generating text, the LLM emits structured tool calls (JSON function invocations conforming to schemas). The runtime executes the tool in the environment and appends the result as an "observation" back into the model context until a final answer is achieved. The Model Context Protocol (MCP) is an open standard created by Anthropic that decouples LLMs from specific tool integrations via a standardized client-server JSON-RPC architecture. An MCP host connects to MCP servers exposing standardized Prompts, Resources, and Tools, eliminating N-to-M bespoke connector integrations.',
    detailedExplanation: `### The ReAct (Reason + Act) Agent Loop
1. **Thought:** The LLM reasons about the user goal and decomposes it into sub-goals.
2. **Action:** The LLM selects an available tool from its system prompt schemas and formats arguments.
3. **Execution & Observation:** The execution runtime runs the tool (e.g. database query, web search, code execution) and feeds the output back into the message history with role \`tool\`.
4. **Reflection:** The agent evaluates if the goal is satisfied; if not, it loops back to step 1.

### Model Context Protocol (MCP) Architecture
Prior to MCP, every IDE, agent framework (LangChain, AutoGen, CrewAI), and LLM vendor wrote proprietary tool formatters.
MCP introduces an open client-server protocol over JSON-RPC 2.0 (via stdio or SSE):
- **MCP Host:** The AI interface (Claude Desktop, Antigravity IDE, custom agents).
- **MCP Client:** Maintains stateful connections with one or more MCP servers.
- **MCP Server:** Exposes domain capabilities cleanly categorized as:
  1. **Resources:** Read-only data (file contents, database schemas, API specs).
  2. **Tools:** Callable actions with side effects (run SQL, send email, execute command).
  3. **Prompts:** Pre-engineered templates with dynamic arguments.

### Agent Safety & Production Guardrails
- **Loop Termination:** Hard bounds on maximum iterations (e.g. max 15 steps) and token budgets.
- **Human-in-the-Loop (HITL):** Requiring explicit user approval for destructive tool calls (file deletion, financial transactions, database drops).
- **Schema Validation:** Strict runtime validation (Zod / Pydantic) on LLM tool outputs before executing code.`,
    practicalExample: `In a production database assistant:
The agent receives: "Analyze our top 5 slowest queries from yesterday."
Without hardcoded SQL integrations, the agent talks to a PostgreSQL MCP server exposing \`query_pg_stat_statements\`. The MCP server handles DB connection pooling and read-only permission scoping, while the agent focuses purely on reasoning and formatting results.`,
    pythonCode: `# Python pseudo-code for a ReAct Agent Execution Loop:
import json

def run_agent_loop(llm_client, user_goal: str, tools_registry: dict, max_steps: int = 5):
    messages = [
        {"role": "system", "content": "You are an autonomous agent with tool access."},
        {"role": "user", "content": user_goal}
    ]

    for step in range(max_steps):
        # 1. Model Call with Tool Schemas
        response = llm_client.chat(messages=messages, tools=list(tools_registry.values()))
        
        # If model returned text rather than tool call, task is finished
        if not response.tool_calls:
            return response.text
            
        for tool_call in response.tool_calls:
            tool_name = tool_call.name
            tool_args = json.loads(tool_call.arguments)
            
            # 2. Safe execution
            tool_fn = tools_registry[tool_name]["handler"]
            observation = tool_fn(**tool_args)
            
            # 3. Append observation back to message context
            messages.append({"role": "assistant", "tool_calls": [tool_call]})
            messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(observation)})
            
    return "Error: Exceeded max allowed reasoning steps."`,
    javaCode: `// Java interface for an MCP Tool definition:
import java.util.Map;

public interface McpTool {
    String getName();
    String getDescription();
    Map<String, Object> getInputSchema(); // JSON Schema representation
    String execute(Map<String, Object> arguments) throws Exception;
}`,
    timeComplexity: 'Latency is O(S * (T_llm + T_tool)) where S is the number of agent reasoning steps.',
    spaceComplexity: 'Context window grows linearly with each turn: O(S * (Prompt + Observation size)).',
    commonMistakes: [
      'Allowing unrestricted while-loops without iteration limits, causing runaway token billing.',
      'Allowing tools to return massive raw API dumps (e.g. 100,000 JSON rows) directly into LLM context instead of summarized slices.',
      'Failing to sandbox tool execution environments (e.g. running code tools on the host system without containers).',
    ],
    followUpQuestions: [
      'How does MCP handle streaming tool results and progress notifications?',
      'How do you prevent Prompt Injection attacks via untrusted tool observations (Indirect Prompt Injection)?',
      'What are the advantages of JSON-RPC over REST for local agent-to-tool IPC?',
    ],
    experienceExpectations: {
      junior: 'Understands that LLMs can call predefined functions with JSON arguments.',
      mid: 'Builds working agent loops with LangChain or OpenAI Assistants API with error handling.',
      senior: 'Explains Model Context Protocol architecture, handles token context compression, and designs tool authorization.',
      staffOrLead: 'Architects multi-agent swarms with MCP infrastructure, enforces security guardrails against prompt injection, and designs audit logging.',
    },
    prerequisites: ['LLM APIs', 'JSON Schema', 'Client-Server protocols', 'Async I/O'],
    tags: ['Generative AI', 'AI Agents', 'MCP', 'Tool Calling', 'ReAct', 'System Design'],
    status: 'published',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-01',
    topicId: 'topic-py-gil',
    question: 'Why does CPython rely on the Global Interpreter Lock (GIL)?',
    type: 'multiple_choice',
    options: [
      'To prevent multiple OS processes from sharing the same port number',
      'Because CPython’s reference counting memory management is not thread-safe',
      'To force all Python developers to write asynchronous code instead of threads',
      'To speed up CPU-bound mathematical operations across multiple cores',
    ],
    correctAnswerIndex: 1,
    explanation: 'CPython uses reference counting to track object lifecycles. Without the GIL, concurrent threads modifying object reference counts simultaneously would produce race conditions and memory corruption.',
    difficulty: 'intermediate',
  },
  {
    id: 'quiz-02',
    topicId: 'topic-py-gil',
    question: 'What is the expected output of this Python snippet?',
    type: 'code_output',
    codeSnippet: {
      language: 'python',
      code: `a = [1, 2, 3]
b = a
b.append(4)
print(len(a))`,
    },
    options: ['3', '4', 'Error: Cannot modify aliased list', 'None'],
    correctAnswerIndex: 1,
    explanation: 'In Python, variables store references to objects. "b = a" assigns the reference to the same list object in memory, so mutating "b" modifies "a".',
    difficulty: 'beginner',
  },
  {
    id: 'quiz-03',
    topicId: 'topic-java-jvm-memory',
    question: 'Which JVM memory area holds class metadata, method bytecode, and runtime constant pools in Java 8+?',
    type: 'multiple_choice',
    options: [
      'PermGen (Permanent Generation)',
      'Eden Space',
      'Metaspace (allocated in native OS memory)',
      'Thread Stack',
    ],
    correctAnswerIndex: 2,
    explanation: 'Starting in Java 8, PermGen was removed and replaced by Metaspace, which is allocated from native memory rather than the fixed contiguous Java heap.',
    difficulty: 'intermediate',
  },
  {
    id: 'quiz-04',
    topicId: 'topic-dsa-sliding-window',
    question: 'What is the optimal time complexity to find the longest substring without repeating characters in a string of length N?',
    type: 'multiple_choice',
    options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(2^N)'],
    correctAnswerIndex: 2,
    explanation: 'Using the sliding window technique with a hash map of last seen indices, each character is examined at most twice, resulting in optimal O(N) time complexity.',
    difficulty: 'beginner',
  },
  {
    id: 'quiz-05',
    topicId: 'topic-sys-stack-heap',
    question: 'True or False: Stack allocation is significantly faster than Heap allocation because it only requires incrementing or decrementing the CPU stack pointer register.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswerIndex: 0,
    explanation: 'True. Stack allocation is a single CPU instruction modifying the stack pointer (RSP), while heap allocation requires allocator routines, free list lookups, and potential synchronization.',
    difficulty: 'intermediate',
  },
  {
    id: 'quiz-06',
    topicId: 'topic-genai-rag-pipeline',
    question: 'Why is Reciprocal Rank Fusion (RRF) used in production RAG systems?',
    type: 'multiple_choice',
    options: [
      'To convert PDF documents into vector embeddings automatically',
      'To merge and re-rank results from both dense vector search and sparse keyword (BM25) search without needing normalized scores',
      'To compress the prompt so it fits into small 4k context windows',
      'To encrypt private user embeddings before saving them to the database',
    ],
    correctAnswerIndex: 1,
    explanation: 'RRF combines ranked lists from different retrieval algorithms (dense vector embeddings + BM25 keyword matching) purely based on their reciprocal rank positions, bypassing calibration issues between disparate score ranges.',
    difficulty: 'advanced',
  },
  {
    id: 'quiz-07',
    topicId: 'topic-arch-event-driven',
    question: 'In an event-driven microservices architecture, what problem does the Transactional Outbox Pattern solve?',
    type: 'multiple_choice',
    options: [
      'It prevents users from sending too many spam emails',
      'It avoids dual-write inconsistency between the database transaction and message broker publishing',
      'It compresses Kafka messages so they consume less network bandwidth',
      'It replaces SQL databases with NoSQL document stores',
    ],
    correctAnswerIndex: 1,
    explanation: 'The Transactional Outbox Pattern writes the domain entity change and an outbox event in the same local ACID transaction. An asynchronous CDC process reads the outbox to publish to Kafka, eliminating dual-write inconsistencies.',
    difficulty: 'expert',
  },
  {
    id: 'quiz-08',
    topicId: 'topic-genai-mcp-agents',
    question: 'In the Model Context Protocol (MCP), what are the three primary capability primitives exposed by MCP servers to AI hosts?',
    type: 'multiple_choice',
    options: [
      'Tokens, Checkpoints, and Loss functions',
      'Prompts, Resources, and Tools',
      'Weights, Biases, and Activations',
      'Queries, Mutations, and Subscriptions',
    ],
    correctAnswerIndex: 1,
    explanation: 'The open Model Context Protocol standard defines three core primitives: Resources (read-only data), Tools (executable actions with side effects), and Prompts (reusable parameterized prompt templates).',
    difficulty: 'advanced',
  },
];
