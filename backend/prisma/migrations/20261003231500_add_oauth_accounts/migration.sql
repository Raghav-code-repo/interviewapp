-- Adds OAuth identity support without touching existing user rows.
--
-- "User"."passwordHash" becomes nullable so a social-only user (one who has
-- never registered with a password) can exist. Existing rows keep their hashes;
-- this is a NOT NULL relaxation, so no data is rewritten.
ALTER TABLE "User" ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- One row per linked provider identity. The unique index on
-- (provider, providerAccountId) is what prevents a provider identity from ever
-- being attached to two different DevPath users.
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Account_userId_idx" ON "Account"("userId");

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;