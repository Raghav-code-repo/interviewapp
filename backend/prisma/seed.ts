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
