import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { isDatabaseReady, withDatabase } from './prisma';
import { resolveExperienceYears, DEFAULT_EXPERIENCE_BAND } from '../utils/experienceBand';

export interface StoredProfile {
  experienceBand: string;
  experienceYears: number;
  languagePreference: string;
  customRoleName: string | null;
  goal: string;
  dailyGoalQuestions: number;
  customDifficulty: string | null;
}

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  profile: StoredProfile;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  experienceBand: string;
  languagePreference: string;
  customRoleName?: string | null;
  goal: string;
}

export type UpdateProfileInput = Partial<Omit<StoredProfile, never>>;

/** Shape returned to clients — never includes the password hash. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
  profile: StoredProfile;
}

const BCRYPT_ROUNDS = 10;

function defaultProfile(): StoredProfile {
  return {
    experienceBand: DEFAULT_EXPERIENCE_BAND,
    experienceYears: resolveExperienceYears(DEFAULT_EXPERIENCE_BAND),
    languagePreference: 'both',
    customRoleName: 'Backend Engineer',
    goal: 'switch',
    dailyGoalQuestions: 5,
    customDifficulty: null,
  };
}

function buildProfile(input: CreateUserInput): StoredProfile {
  const experienceBand = input.experienceBand || DEFAULT_EXPERIENCE_BAND;
  return {
    ...defaultProfile(),
    experienceBand,
    experienceYears: resolveExperienceYears(experienceBand),
    languagePreference: input.languagePreference || 'both',
    customRoleName: input.customRoleName ?? 'Backend Engineer',
    goal: input.goal || 'switch',
  };
}

/**
 * In-memory demo store, used when no database is configured or reachable so the
 * app remains fully explorable. Data is intentionally process-local and is lost
 * on restart — /api/health reports which mode is active.
 */
const memoryUsers = new Map<string, StoredUser>();

/** Demo account so the documented sample credentials keep working without a DB. */
function seedDemoUser(): void {
  if (memoryUsers.size > 0) return;
  memoryUsers.set('alex@devpath.io', {
    id: 'usr-demo-01',
    email: 'alex@devpath.io',
    passwordHash: bcrypt.hashSync('password123', BCRYPT_ROUNDS),
    name: 'Alex Rivera',
    role: 'candidate',
    profile: {
      experienceBand: '2-5',
      experienceYears: 3,
      languagePreference: 'both',
      customRoleName: 'Backend Engineer',
      goal: 'switch',
      dailyGoalQuestions: 5,
      customDifficulty: null,
    },
  });
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalised = normaliseEmail(email);

  if (await isDatabaseReady()) {
    return withDatabase((prisma) =>
      prisma.user
        .findUnique({
          where: { email: normalised },
          include: { profile: true },
        })
        .then((user) =>
          user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                passwordHash: user.passwordHash,
                profile: user.profile
                  ? {
                      experienceBand: user.profile.experienceBand,
                      experienceYears: user.profile.experienceYears,
                      languagePreference: user.profile.languagePreference,
                      customRoleName: user.profile.customRoleName,
                      goal: user.profile.goal,
                      dailyGoalQuestions: user.profile.dailyGoalQuestions,
                      customDifficulty: user.profile.customDifficulty,
                    }
                  : defaultProfile(),
              }
            : null
        )
    );
  }

  seedDemoUser();
  return memoryUsers.get(normalised) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (await isDatabaseReady()) {
    return withDatabase((prisma) =>
      prisma.user
        .findUnique({ where: { id }, include: { profile: true } })
        .then((user) =>
          user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                passwordHash: user.passwordHash,
                profile: user.profile
                  ? {
                      experienceBand: user.profile.experienceBand,
                      experienceYears: user.profile.experienceYears,
                      languagePreference: user.profile.languagePreference,
                      customRoleName: user.profile.customRoleName,
                      goal: user.profile.goal,
                      dailyGoalQuestions: user.profile.dailyGoalQuestions,
                      customDifficulty: user.profile.customDifficulty,
                    }
                  : defaultProfile(),
              }
            : null
        )
    );
  }

  seedDemoUser();
  for (const user of memoryUsers.values()) {
    if (user.id === id) return user;
  }
  return null;
}

/**
 * Creates a user with a bcrypt-hashed password. Returns null when the email is
 * already taken so callers can map that onto a 409.
 */
export async function createUser(input: CreateUserInput): Promise<UserRecord | null> {
  const normalised = normaliseEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const profile = buildProfile(input);

  if (await isDatabaseReady()) {
    return withDatabase(async (prisma) => {
      const existing = await prisma.user.findUnique({
        where: { email: normalised },
        select: { id: true },
      });
      if (existing) return null;

      const user = await prisma.user.create({
        data: {
          email: normalised,
          passwordHash,
          name: input.name.trim(),
          role: 'candidate',
          profile: {
            create: {
              experienceBand: profile.experienceBand,
              experienceYears: profile.experienceYears,
              languagePreference: profile.languagePreference,
              customRoleName: profile.customRoleName,
              goal: profile.goal,
              dailyGoalQuestions: profile.dailyGoalQuestions,
            },
          },
        },
        include: { profile: true },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        profile,
      };
    });
  }

  seedDemoUser();
  if (memoryUsers.has(normalised)) return null;

  const user: StoredUser = {
    id: randomUUID(),
    email: normalised,
    passwordHash,
    name: input.name.trim(),
    role: 'candidate',
    profile,
  };
  memoryUsers.set(normalised, user);
  return user;
}

export async function updateUserProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<StoredProfile | null> {
  if (await isDatabaseReady()) {
    return withDatabase(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!user) return null;

      const merged = {
        experienceBand: user.profile?.experienceBand ?? DEFAULT_EXPERIENCE_BAND,
        experienceYears: user.profile?.experienceYears ?? resolveExperienceYears(DEFAULT_EXPERIENCE_BAND),
        languagePreference: user.profile?.languagePreference ?? 'both',
        customRoleName: user.profile?.customRoleName ?? null,
        goal: user.profile?.goal ?? 'switch',
        dailyGoalQuestions: user.profile?.dailyGoalQuestions ?? 5,
        customDifficulty: user.profile?.customDifficulty ?? null,
        ...updates,
      };

      // Keep years consistent with the band unless the caller supplied years too.
      if (updates.experienceBand !== undefined && updates.experienceYears === undefined) {
        merged.experienceYears = resolveExperienceYears(merged.experienceBand);
      }

      const saved = await prisma.candidateProfile.upsert({
        where: { userId },
        update: merged,
        create: { userId, ...merged },
      });

      return {
        experienceBand: saved.experienceBand,
        experienceYears: saved.experienceYears,
        languagePreference: saved.languagePreference,
        customRoleName: saved.customRoleName,
        goal: saved.goal,
        dailyGoalQuestions: saved.dailyGoalQuestions,
        customDifficulty: saved.customDifficulty,
      };
    });
  }

  seedDemoUser();
  const user = memoryUsers.get(normaliseEmailById(userId));
  if (!user) return null;

  const merged = { ...user.profile, ...updates };
  if (updates.experienceBand !== undefined && updates.experienceYears === undefined) {
    merged.experienceYears = resolveExperienceYears(merged.experienceBand);
  }
  user.profile = merged;
  return user.profile;
}

function normaliseEmailById(userId: string): string {
  for (const [email, user] of memoryUsers) {
    if (user.id === userId) return email;
  }
  return '';
}

/** Removes the password hash so it can never reach a response payload. */
export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/** Test helper: resets the in-memory store. */
export function resetMemoryStore(): void {
  memoryUsers.clear();
}
