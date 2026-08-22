-- Starred articles: a virtual "Starred" folder in the feed that spans every
-- source folder. Starring never generates media.
-- Run once against the production database (Railway):
--   psql "$DATABASE_URL" -f prisma/manual/2026-08-22-starred-articles.sql
--
-- Equivalent to `prisma db push` against the new schema. No data loss.

BEGIN;

ALTER TABLE "Article" ADD COLUMN "starredAt" TIMESTAMP(3);
CREATE INDEX "Article_starredAt_idx" ON "Article"("starredAt");

COMMIT;

-- Rollback:
--   DROP INDEX "Article_starredAt_idx";
--   ALTER TABLE "Article" DROP COLUMN "starredAt";
