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
  /** Null for a social-only account that has never set a password. */
  passwordHash: string | null;
  name: string;
  role: string;
  profileImage: string | null;
  profile: StoredProfile;
  /** Providers linked to this user. 'password' is included when a hash exists. */
  providers: string[];
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
  profileImage: string | null;
  /** Linked login methods, e.g. ['password', 'google']. Safe to display. */
  providers: string[];
}

export interface UserRecord extends PublicUser {
  /** Null for a social-only account. Never serialised to the client. */
  passwordHash: string | null;
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

/**
 * In-memory Account rows, keyed by "provider:providerAccountId". Social sign-in
 * is unavailable without a database, but keeping the shape here means the linking
 * logic above is exercised identically in both storage modes.
 */
const memoryAccounts = new Map<string, string>();

/** Demo account so the documented sample credentials keep working without a DB. */
function seedDemoUser(): void {
  if (memoryUsers.size > 0) return;
  memoryUsers.set('alex@devpath.io', {
    id: 'usr-demo-01',
    email: 'alex@devpath.io',
    passwordHash: bcrypt.hashSync('password123', BCRYPT_ROUNDS),
    name: 'Alex Rivera',
    role: 'candidate',
    profileImage: null,
    providers: ['password'],
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

/** Reads a joined Prisma User row into the store's own shape. */
function mapUserRow(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string | null;
  profileImage: string | null;
  profile: {
    experienceBand: string;
    experienceYears: number;
    languagePreference: string;
    customRoleName: string | null;
    goal: string;
    dailyGoalQuestions: number;
    customDifficulty: string | null;
  } | null;
  accounts: { provider: string }[];
}): StoredUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    passwordHash: user.passwordHash,
    profileImage: user.profileImage,
    // 'password' is a synthetic entry so the UI can show which methods work for
    // this account without exposing anything about the hash itself.
    providers: [
      ...(user.passwordHash ? ['password'] : []),
      ...user.accounts.map((a) => a.provider),
    ],
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
  };
}

/** Every user read needs the linked accounts to populate `providers`. */
const USER_INCLUDE = { profile: true, accounts: true } as const;

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalised = normaliseEmail(email);

  if (await isDatabaseReady()) {
    const user = await withDatabase((prisma) =>
      prisma.user.findUnique({ where: { email: normalised }, include: USER_INCLUDE })
    );
    return user ? mapUserRow(user) : null;
  }

  seedDemoUser();
  return memoryUsers.get(normalised) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (await isDatabaseReady()) {
    const user = await withDatabase((prisma) =>
      prisma.user.findUnique({ where: { id }, include: USER_INCLUDE })
    );
    return user ? mapUserRow(user) : null;
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
    const user = await withDatabase(async (prisma) => {
      const existing = await prisma.user.findUnique({
        where: { email: normalised },
        select: { id: true },
      });
      if (existing) return null;

      return prisma.user.create({
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
        include: USER_INCLUDE,
      });
    });
    return user ? mapUserRow(user) : null;
  }

  seedDemoUser();
  if (memoryUsers.has(normalised)) return null;

  const user: StoredUser = {
    id: randomUUID(),
    email: normalised,
    passwordHash,
    name: input.name.trim(),
    role: 'candidate',
    profileImage: null,
    providers: ['password'],
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
    profileImage: user.profileImage,
    providers: user.providers,
  };
}

/* -------------------------------------------------------------------------- */
/* Social identity linking                                                    */
/* -------------------------------------------------------------------------- */

export type SocialLinkOutcome =
  /** A brand new DevPath user was created for this provider identity. */
  | 'created'
  /** An existing user by email now has this provider linked to it. */
  | 'linked'
  /** This provider identity was already linked; nothing changed. */
  | 'existing';

export interface SocialLinkResult {
  user: UserRecord;
  outcome: SocialLinkOutcome;
}

export interface SocialIdentityInput {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  profileImage?: string | null;
}

function isUniqueConstraintError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === 'P2002' ||
    (typeof e.message === 'string' && /unique constraint/i.test(e.message))
  );
}

export class SocialAccountLinkRequiredError extends Error {
  readonly code = 'SOCIAL_ACCOUNT_LINK_REQUIRED';
  readonly statusCode = 409;

  constructor(provider: string = 'Facebook') {
    const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    super(
      `An account with this email address already exists. Please sign in with your password or existing provider and connect ${formattedProvider} from your profile settings.`
    );
    this.name = 'SocialAccountLinkRequiredError';
  }
}

/**
 * Resolves a verified provider identity onto exactly one DevPath user.
 *
 * Order and policy:
 *   1. Prior link for (provider, providerAccountId) returns the existing linked user.
 *      Avatar is refreshed if provided, but local name/email edits are preserved.
 *   2. Matching existing DevPath email:
 *      - Google ONLY: automatic linking is permitted because Google identity includes
 *        a cryptographically verified email.
 *      - Facebook: automatic linking is NOT permitted. Throws SocialAccountLinkRequiredError
 *        to prevent account takeover. The existing account, user, and passwordHash
 *        are left completely untouched.
 *   3. Brand new identity with unused email:
 *      Creates a new candidate user with `passwordHash = null`.
 *   4. Concurrency races:
 *      Safely re-reads the account/user if a concurrent request creates the identity.
 */
export async function linkSocialIdentity(
  identity: SocialIdentityInput
): Promise<SocialLinkResult> {
  const normalisedEmail = normaliseEmail(identity.email);

  if (await isDatabaseReady()) {
    return withDatabase(async (prisma) => {
      // 1. Existing provider link
      const linked = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: identity.provider,
            providerAccountId: identity.providerAccountId,
          },
        },
        include: { user: { include: USER_INCLUDE } },
      });

      if (linked) {
        // Refresh the avatar, but never touch email/name: the user may have
        // edited those locally and the provider is not authoritative for them.
        if (identity.profileImage) {
          await prisma.user.update({
            where: { id: linked.user.id },
            data: { profileImage: identity.profileImage },
          });
        }
        // Re-read rather than reusing `linked.user`, which was fetched before the
        // write and would therefore report a stale provider list.
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: linked.user.id },
          include: USER_INCLUDE,
        });
        return { user: mapUserRow(user), outcome: 'existing' as const };
      }

      // 2. Existing user by email
      const byEmail = await prisma.user.findUnique({
        where: { email: normalisedEmail },
        include: USER_INCLUDE,
      });

      if (byEmail) {
        // Google email is verified by Google, so automatic linking to an existing account is allowed.
        if (identity.provider === 'google') {
          try {
            await prisma.account.create({
              data: {
                userId: byEmail.id,
                provider: identity.provider,
                providerAccountId: identity.providerAccountId,
              },
            });
          } catch (err: unknown) {
            // Handle unique constraint race if another request created the account concurrently
            if (isUniqueConstraintError(err)) {
              const existingAccount = await prisma.account.findUnique({
                where: {
                  provider_providerAccountId: {
                    provider: identity.provider,
                    providerAccountId: identity.providerAccountId,
                  },
                },
                include: { user: { include: USER_INCLUDE } },
              });
              if (existingAccount) {
                return { user: mapUserRow(existingAccount.user), outcome: 'existing' as const };
              }
            }
            throw err;
          }

          // passwordHash is deliberately not touched, so an existing password
          // keeps working after linking.
          await prisma.user.update({
            where: { id: byEmail.id },
            data: { profileImage: identity.profileImage ?? byEmail.profileImage },
          });

          // Re-read so the returned record reflects the attached account
          const user = await prisma.user.findUniqueOrThrow({
            where: { id: byEmail.id },
            include: USER_INCLUDE,
          });

          return { user: mapUserRow(user), outcome: 'linked' as const };
        }

        // Facebook (or non-Google provider): do NOT automatically link to an existing account.
        // Prevent account hijacking: do not create Account, do not modify User or passwordHash.
        throw new SocialAccountLinkRequiredError(identity.provider);
      }

      // 3. New identity with no existing DevPath account
      try {
        const created = await prisma.user.create({
          data: {
            email: normalisedEmail,
            // Social-only account: null, not a fabricated password.
            passwordHash: null,
            name: identity.name.trim() || normalisedEmail.split('@')[0],
            profileImage: identity.profileImage ?? null,
            // Explicitly 'candidate' — a social login must never inherit admin.
            role: 'candidate',
            accounts: {
              create: {
                provider: identity.provider,
                providerAccountId: identity.providerAccountId,
              },
            },
            profile: {
              create: {
                experienceBand: DEFAULT_EXPERIENCE_BAND,
                experienceYears: resolveExperienceYears(DEFAULT_EXPERIENCE_BAND),
                languagePreference: 'both',
                customRoleName: 'Backend Engineer',
                goal: 'switch',
                dailyGoalQuestions: 5,
              },
            },
          },
          include: USER_INCLUDE,
        });

        return { user: mapUserRow(created), outcome: 'created' as const };
      } catch (err: unknown) {
        // Concurrency handling: another request concurrently created the Account or User
        if (isUniqueConstraintError(err)) {
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: identity.provider,
                providerAccountId: identity.providerAccountId,
              },
            },
            include: { user: { include: USER_INCLUDE } },
          });
          if (existingAccount) {
            return { user: mapUserRow(existingAccount.user), outcome: 'existing' as const };
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: normalisedEmail },
            include: USER_INCLUDE,
          });
          if (existingUser) {
            if (identity.provider === 'google') {
              try {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    provider: identity.provider,
                    providerAccountId: identity.providerAccountId,
                  },
                });
              } catch (linkErr: unknown) {
                if (!isUniqueConstraintError(linkErr)) throw linkErr;
              }
              const updated = await prisma.user.findUniqueOrThrow({
                where: { id: existingUser.id },
                include: USER_INCLUDE,
              });
              return { user: mapUserRow(updated), outcome: 'existing' as const };
            } else {
              throw new SocialAccountLinkRequiredError(identity.provider);
            }
          }
        }
        throw err;
      }
    });
  }

  // In-memory fallback: social sign-in needs a real database to persist links,
  // so refuse rather than pretending a link was stored.
  throw new SocialLinkUnavailableError();
}

export class SocialLinkUnavailableError extends Error {
  readonly code = 'DATABASE_UNAVAILABLE';
  readonly statusCode = 503;

  constructor() {
    super('Social sign-in requires a reachable database. Please try again shortly.');
    this.name = 'SocialLinkUnavailableError';
  }
}

/** Test helper: resets the in-memory store. */
export function resetMemoryStore(): void {
  memoryUsers.clear();
  memoryAccounts.clear();
}
