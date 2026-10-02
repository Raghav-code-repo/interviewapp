import { PrismaClient } from '@prisma/client';
import { config } from '../config';

type DatabaseStatus = 'unconfigured' | 'checking' | 'available' | 'unavailable';

let prisma: PrismaClient | null = null;
let status: DatabaseStatus = 'unconfigured';
let lastError: string | null = null;
let inFlightProbe: Promise<boolean> | null = null;

/**
 * Lazily constructs the PrismaClient. Only called once a DB-backed operation
 * actually needs it, so a missing/unreachable database degrades to in-memory
 * storage instead of crashing the process at boot.
 */
function getPrisma(): PrismaClient | null {
  if (!config.isDatabaseConfigured) {
    status = 'unconfigured';
    return null;
  }
  if (!prisma) {
    prisma = new PrismaClient({
      log: config.isProduction ? ['error'] : ['error', 'warn'],
    });
  }
  return prisma;
}

/**
 * Runs a single lightweight round-trip to confirm the database is actually
 * reachable. The result is cached: a successful probe is not re-run, but a
 * failure is retried on the next call so the app can recover if the database
 * comes back up without a restart.
 */
async function probe(): Promise<boolean> {
  const client = getPrisma();
  if (!client) return false;

  if (status === 'available') return true;

  // Collapse concurrent probes into one in-flight connection attempt.
  if (inFlightProbe) return inFlightProbe;

  status = 'checking';
  inFlightProbe = (async () => {
    try {
      await client.$queryRaw`SELECT 1`;
      status = 'available';
      lastError = null;
      return true;
    } catch (err) {
      status = 'unavailable';
      lastError = err instanceof Error ? err.message : String(err);
      return false;
    } finally {
      inFlightProbe = null;
    }
  })();

  return inFlightProbe;
}

/**
 * True when a database round-trip is viable right now. Callers use this to pick
 * between Prisma-backed persistence and the in-memory demo store.
 */
export async function isDatabaseReady(): Promise<boolean> {
  if (!config.isDatabaseConfigured) {
    status = 'unconfigured';
    return false;
  }

  // Guard against an unreachable host (e.g. blocked port) hanging the request.
  const timeout = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), config.databaseProbeTimeoutMs)
  );

  const outcome = await Promise.race([probe(), timeout]);
  if (outcome === 'timeout') {
    lastError = `Connection probe exceeded ${config.databaseProbeTimeoutMs}ms`;
    status = 'unavailable';
    return false;
  }
  return outcome;
}

export function getDatabaseStatus(): DatabaseStatus {
  return status;
}

export function getDatabaseError(): string | null {
  return lastError;
}

/**
 * Wraps a Prisma operation so that a database failure surfaces as a thrown error
 * the route can handle, rather than being silently swallowed. Callers should only
 * invoke this after `isDatabaseReady()` returns true.
 */
export async function withDatabase<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
  const client = getPrisma();
  if (!client) {
    throw new Error('Database operations requested but DATABASE_URL is not configured.');
  }
  return operation(client);
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
  status = config.isDatabaseConfigured ? 'unavailable' : 'unconfigured';
}
