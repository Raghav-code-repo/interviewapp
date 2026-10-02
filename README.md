# DevPath Interview Academy

> **Production-grade developer interview preparation web application for candidates with 0–20+ years of professional experience.**

DevPath Interview Academy delivers structured, role-adapted interview training across **8 core technical domains**: Python, Java, Data Structures & Algorithms, Memory & Systems Programming, Full Stack Web Engineering, AI & Deep Learning, Generative AI & Agentic Systems, and Software Architecture & Engineering Leadership.

---

## 1. Key Architectural Features

- **Adaptive Experience Engine (0 to 20+ YOE):**
  - Calibrated expectations from Junior (syntax & foundational DSA) to Staff/Architect (distributed transactions, event sourcing, low-latency GC, and organizational governance).
  - 5-step onboarding wizard generating a customized milestone roadmap.
- **Deep Technical Taxonomy:**
  - `Category` → `Subject` → `Topic` → `Concept` → `Question`.
  - Dual executable code references for both **Python 3.12+** and **Java 21 LTS**.
- **Question & Answer Studio Experience:**
  - 2-minute elevator pitch short answer.
  - Architectural breakdown with real-world failure case studies.
  - Exact time and space complexity heuristics.
  - Common pitfalls and critical boundary edge cases.
  - Progressive follow-up interview probes.
  - Multi-tier interviewer expectations (Junior, Mid, Senior, Staff/Lead).
- **Interactive Coding Playground:**
  - Integrated **Monaco Editor** with Python and Java templates.
  - Safe client-side test case execution adapter.
  - Progressive hints and solution reveal.
- **Quiz & Diagnostic Engine:**
  - Multiple choice, true/false, and code snippet output questions with timers and answer keys.
- **Timed Mock Interview Sessions:**
  - Configurable duration (15m, 30m, 45m).
  - One-question-at-a-time live simulation.
  - Structured rubric feedback with clear simulated coaching disclaimers.
- **Spaced Repetition & Revision Schedule:**
  - Cognitive retention intervals (1, 3, 7, 14, 30 days) to prevent knowledge decay.
- **Admin Content Studio (CMS):**
  - Full Question CRUD with editorial lifecycle workflow (`draft`, `needs_review`, `published`).
  - Documented bulk JSON import and export.
- **Production Design System:**
  - Dark navy collapsible sidebar with light content workspace.
  - Indigo/violet accents, subtle borders, accessible keyboard shortcuts (`⌘K` / `Ctrl+K` global search).

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript (Strict mode)
- **Bundler:** Vite
- **Styling:** Tailwind CSS with custom navy & brand palette
- **Routing:** React Router v6
- **Data Fetching:** TanStack Query (React Query)
- **Icons:** Lucide React
- **Visualizations:** Recharts (Bar & Donut charts)
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Animation/Celebration:** canvas-confetti

### Backend
- **Runtime:** Node.js (v20+ / v24+)
- **Server:** Express with TypeScript
- **Validation:** Zod schemas
- **Authentication:** JWT with bcryptjs password hashing
- **Database ORM:** Prisma ORM
- **Database Engine:** Supabase PostgreSQL (or any standard PostgreSQL 15+)
- **Testing:** Vitest

---

## 3. Project Directory Structure

```
d:\interviewapp/
├── package.json                   # Root monorepo workspace scripts
├── README.md                      # Complete system documentation
├── .env.example                   # Master environment configuration
├── frontend/                      # React 18 + Vite application
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── types/                 # Shared data models & TypeScript contracts
│       ├── data/                  # Seed dataset for offline/standalone demo mode
│       ├── context/               # Profile, Progress, Theme state providers
│       ├── services/              # Unified API client with automatic fallback
│       ├── utils/                 # cn tailwind merge, formatting helpers
│       ├── components/
│       │   ├── ui/                # Button, Card, Badge, Tabs, Modal, Input, Skeleton
│       │   ├── layout/            # Dark navy Sidebar, TopNav, AppShell, SearchModal
│       │   ├── onboarding/        # 5-step Candidate Profile Wizard
│       │   ├── dashboard/         # KPI cards, Recharts domain mastery, next recommendations
│       │   ├── roadmap/           # Phase-by-phase dynamic milestones
│       │   ├── taxonomy/          # Category, subject & topic explorer
│       │   ├── questions/         # Rich Q&A view with dual code tabs & TOC
│       │   ├── playground/        # Monaco code editor, test runner, hints
│       │   ├── quiz/              # Timed diagnostic quiz runner & score breakdown
│       │   ├── mock-interview/    # Timed role simulation & rubric feedback
│       │   └── admin/             # Content Studio CMS, CRUD & JSON import/export
│       ├── pages/                 # Route page components
│       ├── App.tsx                # Main router & query client setup
│       ├── main.tsx               # DOM bootstrap
│       └── index.css              # Custom scrollbars & Tailwind base styles
└── backend/                       # Express + Prisma API server
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma          # 19 relational models with UUIDs & indexes
    │   └── seed.ts                # Database seeder script
    └── src/
        ├── types/                 # Request & API contracts
        ├── middleware/            # Error handling, JWT auth, logging
        ├── routes/                # Health, Auth, Taxonomy, Questions, Quizzes, Mock, Progress, Admin
        ├── services/              # Seed dataset fallback & business logic
        ├── __tests__/             # Vitest unit test suites
        └── index.ts               # Express bootstrap & graceful shutdown
```

---

## 4. Local Setup & Quick Start

### Prerequisites
- Node.js `v20.x` or `v24.x`
- npm `v10.x` or `v11.x`

### 1. Install Dependencies
```bash
# In frontend directory
cd frontend
npm install

# In backend directory
cd ../backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# In backend
cp .env.example .env

# In frontend
cp .env.example .env
```

### 3. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend App):**
```bash
cd frontend
npm run dev
# Vite dev server starts at http://localhost:5173
```

Visit **http://localhost:5173** in your browser. The application runs immediately with realistic seeded data.

---

## 5. Database Setup & Prisma Migrations (Supabase)

The API persists accounts and candidate profiles to PostgreSQL via Prisma. If `DATABASE_URL`
is blank or unreachable, the server logs a warning and falls back to an in-process store so
the app still runs — `/api/health` reports which mode is active.

### 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to **Project Settings** → **Data Sources** (or **Database**).
3. If you do not know your password, use **Reset database password** and copy it once.

### 2. Configure `backend/.env`
```bash
cd backend
cp .env.example .env
```

Two connection strings are needed, because migrations cannot run through a pooler:

| Variable | Purpose | Where to get it |
|---|---|---|
| `DATABASE_URL` | Runtime reads/writes | **Session pooler** (port `5432`) tab |
| `DIRECT_URL` | `prisma migrate` only | **URI** (direct) tab |

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Two details that commonly cause failures:

- The **pooler username includes the project ref** (`postgres.PROJECTREF`); the direct URL
  uses plain `postgres`.
- The **direct URL requires IPv6**. If `prisma migrate` hangs, set `DIRECT_URL` to the
  session pooler URL as well — it works over IPv4, you simply lose pooling for migrations.

If your password contains `@ : / ?` or `#`, URL-encode it:
`node -e "console.log(encodeURIComponent('your password'))"`.

### 3. Generate Prisma Client & Run Migrations
```bash
cd backend

npx prisma generate
npx prisma migrate dev --name init   # uses DIRECT_URL
npm run prisma:seed                   # demo + admin accounts, taxonomy, reference data
```

### 4. Set a Real JWT Secret
`JWT_SECRET` **must** be set in production — the server refuses to boot when
`NODE_ENV=production` and the value is missing, because a shared fallback secret would let
anyone mint an admin token. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 6. Accounts & Seed Data

`npm run prisma:seed` creates these accounts:

| Email | Password | Role | Purpose |
|---|---|---|---|
| `alex@devpath.io` | `password123` | `candidate` | Sample candidate, 2–5 YOE, Backend Engineer |
| `admin@devpath.io` | `admin12345` | `admin` | Content Studio access |

The admin password can be overridden at seed time with `SEED_ADMIN_PASSWORD`. **Change it
before deploying.** The Admin Studio link is hidden in the UI and the API returns `403` for
non-admin accounts, so both layers enforce the role.

Seeded reference data: 8 experience levels, 9 target roles, 8 taxonomy categories.

---

## 6a. Signing In

- `/login` and `/register` are public; every other route is wrapped in `ProtectedRoute` and
  redirects anonymous visitors to `/login`, preserving the intended destination.
- Passwords are hashed with bcrypt (cost 10). The API never returns a hash, and login
  returns the same error for an unknown email and a wrong password so accounts cannot be
  enumerated.
- The JWT is stored in `localStorage` under `devpath_auth_token` and re-verified against
  `GET /api/auth/me` on every page load, so an expired or revoked token cannot leave the UI
  in an authenticated state.

---

## 7. REST API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime and connectivity health check | No |
| `POST` | `/api/auth/register` | Register new candidate account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token | No |
| `GET` | `/api/auth/me` | Retrieve active candidate profile | Yes |
| `PATCH` | `/api/auth/me/profile` | Update experience band, language, role, goal | Yes |
| `GET` | `/api/auth/meta` | Supported experience bands and their year values | No |
| `GET` | `/api/taxonomy/categories` | List all 8 curriculum categories | No |
| `GET` | `/api/questions` | Filter questions by category, difficulty, exp band | No |
| `GET` | `/api/questions/:id` | Get question detail with answers & code examples | No |
| `POST` | `/api/quizzes/submit` | Submit quiz attempt and obtain accuracy score | Optional |
| `POST` | `/api/mock-interviews/start` | Start timed mock interview session | Optional |
| `POST` | `/api/mock-interviews/:id/submit` | Submit answers and receive coaching rubric | Optional |
| `GET` | `/api/progress` | Get candidate progress, bookmarks, and revision queue | Optional |
| `POST` | `/api/progress/bookmark` | Toggle question bookmark | Optional |
| `POST` | `/api/progress/status` | Mark question mastered or in-progress | Optional |
| `POST` | `/api/progress/revision` | Add question to spaced repetition queue | Optional |
| `POST` | `/api/admin/questions` | Admin: Create new interview question | Admin |
| `GET` | `/api/admin/export` | Admin: Export entire question bank as JSON | Admin |

---

## 8. Testing & Verification

Run the automated test suite with Vitest:
```bash
cd backend
npm test
```

### Verified Test Results:
```
✓ src/__tests__/scoring.test.ts (10 tests)
  ✓ Diagnostic Quiz Scoring & Pass Logic (4 tests)
    ✓ calculates 100% when all questions are correct
    ✓ calculates 80% and passes when 4 of 5 are correct
    ✓ calculates 60% and marks failed when below 70% threshold
    ✓ handles zero questions gracefully without divide-by-zero error
  ✓ Experience Adaptation Engine (3 tests)
    ✓ recommends junior and entry questions for 0-2 years candidate
    ✓ recommends intermediate and concurrency questions for 2-5 years candidate
    ✓ recommends advanced and distributed systems questions for 8-12 years candidate
  ✓ Spaced Repetition Scheduling Engine (3 tests)
    ✓ advances from 1 day to 3 days on successful recall
    ✓ advances from 3 days to 7 days on successful recall
    ✓ resets interval back to 1 day if candidate failed to recall

✓ src/__tests__/experienceBand.test.ts (8 tests)
  ✓ Experience band resolution (8 tests)
    ✓ resolves the lower bound for range bands
    ✓ resolves "20+" to 20 rather than failing to parse it
    ✓ resolves the exact value for single-year bands
    ✓ returns null for unrecognised bands instead of a plausible wrong number
    ✓ never reports 0 years as falsy 2 via the fallback helper
    ✓ falls back to the default band for unusable input
    ✓ validates membership of the known band list
    ✓ every advertised band resolves to a usable year count

✓ src/__tests__/auth.test.ts (25 tests)
  ✓ POST /api/auth/register (10 tests)
    ✓ creates an account and returns a signed token
    ✓ never returns the password hash to the client
    ✓ hashes the password with bcrypt instead of storing it verbatim
    ✓ normalises the email to lowercase so duplicates are case-insensitive
    ✓ rejects a duplicate registration with 409
    ✓ rejects a password shorter than 6 characters
    ✓ rejects an invalid email address
    ✓ rejects an unknown experience band
    ✓ stores 0 experience years for the "0-2" band instead of the falsy-value fallback
    ✓ maps "20+" to 20 years
  ✓ POST /api/auth/login (4 tests)
    ✓ issues a token for correct credentials
    ✓ matches the email case-insensitively
    ✓ rejects a wrong password with 401
    ✓ returns the same error for an unknown email so accounts cannot be enumerated
  ✓ GET /api/auth/me (6 tests)
    ✓ returns the current user for a valid token
    ✓ rejects a request with no token
    ✓ rejects a malformed token
    ✓ rejects a token signed with a different secret
    ✓ refuses a token whose account no longer exists
  ✓ Authorization on admin routes (3 tests)
    ✓ rejects an anonymous request to the admin question endpoint
    ✓ rejects a non-admin candidate with 403
    ✓ leaves public content routes reachable without a token
  ✓ Routing fallbacks (1 test)
    ✓ returns 404 for an unknown API route rather than 500
  ✓ PATCH /api/auth/me/profile (2 tests)
    ✓ updates and persists the candidate profile
    ✓ requires authentication

Test Files: 3 passed (3)
Tests:      43 passed (43)
```

The auth suite binds the Express app to an ephemeral port and exercises real HTTP requests,
so it covers routing, validation, hashing and authorization rather than just helper functions.

---

## 9. Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub/GitLab.
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Select your repository and set the **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Configure Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://devpath-api.onrender.com/api`).
8. Deploy!

### Backend Deployment (Render)
1. Log in to [render.com](https://render.com) and create a **Web Service**.
2. Connect your repository and set **Root Directory** to `backend`.
3. Environment: **Node**.
4. Build Command: `npm install && npm run build && npx prisma generate`.
5. Start Command: `npm start`.
6. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CORS_ORIGIN`: Your Vercel frontend URL (e.g. `https://devpath-academy.vercel.app`)
   - `JWT_SECRET`: A high-entropy 64-character secret string — **required**, the server
     refuses to boot in production without it
   - `DATABASE_URL`: Your Supabase PostgreSQL pooler connection string
7. Run migrations once against the production database before first use:
   `npx prisma migrate deploy`

---

## 10. Known Limitations & Next Steps

1. **Progress Is Not Yet Persisted Server-Side.** Accounts and candidate profiles are stored
   in PostgreSQL, but bookmarks, mastery, quiz attempts and the revision queue are still
   held in the browser's `localStorage` (`ProgressContext`) and in process memory on the API
   (`/api/progress/*`). Progress therefore does not follow a user across browsers or devices.
   The Prisma models (`Bookmark`, `LearningProgress`, `RevisionSchedule`, `QuizAttempt`,
   `MockInterview`) already exist and the API client has `syncBookmark`/`syncStatus` stubs
   ready — wiring those routes to Prisma is the next step.
2. **Quiz and Mock Scoring Are Deterministic Heuristics.** `POST /api/quizzes/submit` scores a
   fixed 80% rather than checking answers against an answer key, and mock interview rubrics
   score on answer length. Neither persists an attempt against a real answer set.
3. **Sandboxed Code Execution:** The initial playground uses a safe client-side simulation adapter. Next step is deploying an isolated containerized execution cluster (using gVisor / Firecracker / AWS Lambda) for live compiler testing.
4. **Direct LLM Integration:** The mock interview rubric engine uses an intelligent deterministic scoring model. Connecting directly to the Gemini 1.5 Pro API with streaming tokens is the next planned enhancement.
5. **Audio Speech-to-Text:** Adding Web Speech API or Whisper integration for spoken mock interview answering.
6. **Dark Mode Coverage Is Explicit, With A Safety Net.** Every component carries explicit
   `dark:` variants, so the theme switch is deterministic. `index.css` keeps a small
   `@layer devpath-dark-fallbacks` block as a backstop for future markup added without dark
   variants — it is wrapped in a *named* cascade layer on purpose, because Tailwind 3
   flattens its own layer directives into unlayered CSS, and unlayered rules always beat
   layered ones. That ordering is what stops the fallbacks from overriding explicit variants.
   Surfaces that are intentionally dark in both themes (the blue dashboard hero, the code
   playground, modal backdrops) deliberately have no `dark:` variant.
7. **Tokens Are Stored in `localStorage`.** This is acceptable for a learning platform but is
   readable by any injected script; an httpOnly, SameSite=Strict cookie would be the stronger
   choice if you later add sensitive data.
