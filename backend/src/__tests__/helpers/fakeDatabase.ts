/**
 * Minimal in-memory stand-in for Prisma, covering only the User/Account
 * operations the social-linking path performs.
 *
 * A real database is deliberately not used here: the tests must be able to run
 * with no DATABASE_URL, and more importantly they need to assert on row counts
 * ("no duplicate user was created") without side effects on Supabase.
 */

interface FakeUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string | null;
  profileImage: string | null;
  profile: Record<string, unknown> | null;
  accounts: { provider: string; providerAccountId: string }[];
}

interface FakeAccountRow {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
}

const DEFAULT_PROFILE = {
  experienceBand: '2-5',
  experienceYears: 2,
  languagePreference: 'both',
  customRoleName: 'Backend Engineer',
  goal: 'switch',
  dailyGoalQuestions: 5,
  customDifficulty: null,
};

export function createFakePrismaClient() {
  const state = {
    users: [] as FakeUserRow[],
    accounts: [] as FakeAccountRow[],
  };

  let seq = 0;
  const nextId = (prefix: string) => `${prefix}-${(seq += 1)}`;

  /** Applies a partial `data` object to a row, expanding nested `create` blocks. */
  function assign(
    row: FakeUserRow,
    data: Record<string, any> | undefined,
    opts: { keepId?: boolean } = {}
  ): FakeUserRow {
    if (!data) return row;

    for (const [key, value] of Object.entries(data)) {
      if (key === 'profile' && value && typeof value === 'object' && 'create' in value) {
        row.profile = { ...DEFAULT_PROFILE, ...(value.create ?? {}) };
        continue;
      }
      if (key === 'accounts' && value && typeof value === 'object' && 'create' in value) {
        const created = Array.isArray(value.create) ? value.create : [value.create];
        for (const account of created) {
          state.accounts.push({
            id: nextId('acc'),
            userId: row.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });
        }
        continue;
      }
      if (key === 'id' && opts.keepId) continue;
      (row as unknown as Record<string, unknown>)[key] = value;
    }
    return row;
  }

  const findUser = (id: string) => state.users.find((u) => u.id === id) ?? null;

  /**
   * Resolves the `accounts` relation the way Prisma's `include` does — computed
   * from current state on every read. Caching it on the row would hide exactly
   * the staleness bug these tests exist to catch.
   */
  const hydrate = (row: FakeUserRow | null) => {
    if (!row) return null;
    return {
      ...row,
      accounts: state.accounts
        .filter((a) => a.userId === row.id)
        .map(({ provider, providerAccountId }) => ({ provider, providerAccountId })),
    };
  };

  const user = {
    findUnique: async ({ where }: any) => {
      if (where?.email) return hydrate(state.users.find((u) => u.email === where.email) ?? null);
      if (where?.id) return hydrate(findUser(where.id));
      return null;
    },

    findUniqueOrThrow: async ({ where }: any) => {
      const row = hydrate(
        where?.email ? state.users.find((u) => u.email === where.email) ?? null : findUser(where?.id)
      );
      if (!row) {
        throw new Error(
          'An operation failed because it depends on one or more records that were required but not found.'
        );
      }
      return row;
    },

    create: async ({ data }: any) => {
      // Mirrors the real unique constraint on email so duplicate-creation bugs
      // surface here exactly as they would in Postgres.
      if (data.email && state.users.some((u) => u.email === data.email)) {
        throw new Error('Unique constraint failed on the fields: (`email`)');
      }

      const row: FakeUserRow = {
        id: data.id ?? nextId('usr'),
        email: data.email,
        name: data.name,
        role: data.role ?? 'candidate',
        passwordHash: data.passwordHash ?? null,
        profileImage: data.profileImage ?? null,
        profile: null,
        accounts: [],
      };

      state.users.push(row);
      assign(row, data);

      return hydrate(row)!;
    },

    update: async ({ where, data }: any) => {
      const row = findUser(where.id);
      if (!row) throw new Error('An operation failed because it depends on one or more records that were required but not found.');
      return hydrate(assign(row, data, { keepId: true }))!;
    },
  };

  const account = {
    findUnique: async ({ where, include }: any) => {
      const key = where?.provider_providerAccountId;
      const found = state.accounts.find((a) => {
        if (key) return a.provider === key.provider && a.providerAccountId === key.providerAccountId;
        if (where?.id) return a.id === where.id;
        return false;
      });
      if (!found) return null;
      if (include?.user) {
        return { ...found, user: hydrate(findUser(found.userId)) };
      }
      return { ...found, user: hydrate(findUser(found.userId)) };
    },

    findFirst: async ({ where, include }: any = {}) => {
      const found = state.accounts.find((a) => {
        if (where?.userId && a.userId !== where.userId) return false;
        if (where?.provider && a.provider !== where.provider) return false;
        if (where?.providerAccountId && a.providerAccountId !== where.providerAccountId) return false;
        if (where?.id && a.id !== where.id) return false;
        return true;
      });
      if (!found) return null;
      if (include?.user) {
        return { ...found, user: hydrate(findUser(found.userId)) };
      }
      return { ...found, user: hydrate(findUser(found.userId)) };
    },

    findMany: async ({ where, include }: any = {}) => {
      return state.accounts
        .filter((a) => {
          if (where?.userId && a.userId !== where.userId) return false;
          if (where?.provider && a.provider !== where.provider) return false;
          if (where?.providerAccountId && a.providerAccountId !== where.providerAccountId) return false;
          return true;
        })
        .map((a) => (include?.user ? { ...a, user: hydrate(findUser(a.userId)) } : { ...a }));
    },

    create: ({ data }: any) => {
      const clash = state.accounts.some(
        (a) => a.provider === data.provider && a.providerAccountId === data.providerAccountId
      );
      if (clash) {
        throw new Error('Unique constraint failed on the fields: (`provider`,`providerAccountId`)');
      }
      const row: FakeAccountRow = {
        id: nextId('acc'),
        userId: data.userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
      };
      state.accounts.push(row);
      return Promise.resolve({ ...row });
    },

    update: async ({ where, data }: any) => {
      const key = where?.provider_providerAccountId;
      const found = state.accounts.find((a) => {
        if (key) return a.provider === key.provider && a.providerAccountId === key.providerAccountId;
        if (where?.id) return a.id === where.id;
        return false;
      });
      if (!found) {
        throw new Error('An operation failed because it depends on one or more records that were required but not found.');
      }
      Object.assign(found, data);
      return { ...found };
    },

    delete: async ({ where }: any) => {
      const key = where?.provider_providerAccountId;
      const idx = state.accounts.findIndex((a) => {
        if (key) return a.provider === key.provider && a.providerAccountId === key.providerAccountId;
        if (where?.id) return a.id === where.id;
        return false;
      });
      if (idx === -1) {
        throw new Error('An operation failed because it depends on one or more records that were required but not found.');
      }
      const [removed] = state.accounts.splice(idx, 1);
      return { ...removed };
    },
  };

  const client = {
    user,
    account,
    candidateProfile: {
      findUnique: async () => null,
      upsert: async () => {
        throw new Error('candidateProfile is not implemented in the fake client.');
      },
    },
  };

  return {
    state,
    client,
    user,
    account,
    candidateProfile: client.candidateProfile,
  };
}