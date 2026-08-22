-- Switch TTS to ElevenLabs (via fal.ai) and decouple voices from presenters.
-- Run once against the production database (Railway):
--   psql "$DATABASE_URL" -f prisma/manual/2026-08-22-elevenlabs-voices.sql
--
-- Equivalent to `prisma db push --accept-data-loss` against the new schema,
-- plus the UPDATE that moves the existing config row onto the new model.
--
-- Data loss: Presenter.voiceId is dropped. It held MiniMax voice ids that are
-- meaningless under ElevenLabs. MediaItem.voiceId is NOT touched; old rows keep
-- their legacy id as a label only.

BEGIN;

-- 1. Org-level default voice (ElevenLabs voice name; see src/server/voices.ts).
ALTER TABLE "OrgConfig"
  ADD COLUMN "defaultVoiceId" TEXT NOT NULL DEFAULT 'Brian';

-- 2. New default TTS endpoint, and move the existing row off MiniMax.
ALTER TABLE "OrgConfig"
  ALTER COLUMN "ttsModel" SET DEFAULT 'fal-ai/elevenlabs/tts/multilingual-v2';

UPDATE "OrgConfig"
  SET "ttsModel" = 'fal-ai/elevenlabs/tts/multilingual-v2'
  WHERE "ttsModel" LIKE 'fal-ai/minimax/%';

-- 3. Presenters no longer carry a voice.
ALTER TABLE "Presenter" DROP COLUMN "voiceId";

COMMIT;

-- Rollback sketch (loses nothing extra; restores the column with a placeholder):
--   ALTER TABLE "Presenter" ADD COLUMN "voiceId" TEXT NOT NULL DEFAULT 'Wise_Woman';
--   ALTER TABLE "OrgConfig" DROP COLUMN "defaultVoiceId";
--   ALTER TABLE "OrgConfig" ALTER COLUMN "ttsModel" SET DEFAULT 'fal-ai/minimax/speech-02-hd';

-- Follow-up (applied separately via TablePlus): presenter blurbs are no longer
-- shown now that voices are picked independently.
-- ALTER TABLE "Presenter" DROP COLUMN "bio";
