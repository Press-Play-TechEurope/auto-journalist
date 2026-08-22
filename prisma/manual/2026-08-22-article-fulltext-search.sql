-- Full-text search over articles (title, summary, body).
-- Run once against the production database (Railway):
--   psql "$DATABASE_URL" -f prisma/manual/2026-08-22-article-fulltext-search.sql
--
-- Adds Article.searchVector (tsvector) + GIN index, kept in sync by a trigger
-- on insert/update of title/summary/rawContent/extract, so ingest and enrich
-- need no application code. Weights: A = title, B = summary, C = body (Tavily
-- extract content, else rawContent; capped at 100k chars to stay under the
-- 1MB tsvector limit).
--
-- Why a trigger and not a GENERATED column: Prisma models the column as
-- Unsupported("tsvector") and reads a generation expression as a DEFAULT,
-- so `prisma db push` would try `DROP DEFAULT` and fail. A trigger is
-- invisible to Prisma's diff. Consequence: `prisma db push` on a fresh DB
-- creates the column + index but NOT the trigger — apply this file there too.
--
-- No data loss. Backfill rewrites every Article row once.

BEGIN;

ALTER TABLE "Article" ADD COLUMN "searchVector" tsvector;

CREATE OR REPLACE FUNCTION article_search_vector_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."summary", '')), 'B') ||
    setweight(
      to_tsvector(
        'english',
        left(coalesce(NEW."extract" ->> 'content', NEW."rawContent", ''), 100000)
      ),
      'C'
    );
  RETURN NEW;
END
$$;

CREATE TRIGGER article_search_vector_trg
  BEFORE INSERT OR UPDATE OF "title", "summary", "rawContent", "extract"
  ON "Article"
  FOR EACH ROW EXECUTE FUNCTION article_search_vector_update();

-- Backfill existing rows (a same-value update still fires UPDATE OF "title").
UPDATE "Article" SET "title" = "title";

CREATE INDEX "Article_searchVector_idx" ON "Article" USING GIN ("searchVector");

COMMIT;

-- Rollback:
--   DROP INDEX "Article_searchVector_idx";
--   DROP TRIGGER article_search_vector_trg ON "Article";
--   DROP FUNCTION article_search_vector_update();
--   ALTER TABLE "Article" DROP COLUMN "searchVector";
