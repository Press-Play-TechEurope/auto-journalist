# auto-journalist

> https://auto-journalist.vercel.app/

AI Newsroom — aggregate RSS news, enrich articles with AI, and turn them into talking-head videos ready for social media.

APIs used: 
- Tavily Extract (for extracting article content and images)
- OpenAI (for generating scripts and captions)
- fal.ai (for TTS and Video Generation)
- VEED (model: Fabric 1.0)

## What it does

auto-journalist is a single-tenant web app (one shared password) that watches multiple news sources, helps you pick a story, and produces a short presenter-style video from it:

1. **Aggregate** — add any number of RSS feeds as sources, optionally grouped into folders (e.g. World, Tech). The app polls them on demand (Refresh button, and automatically on page load when stale) and shows a unified feed sorted by date, filterable by folder and source.
2. **Enrich** — pick a story and a presenter, click **Generate video**:
   - The article is downloaded with a plain HTTP fetch and reduced to text.
   - [Tavily Extract](https://docs.tavily.com/#extract-webpages) pulls structured content + images from the URL (best-effort; falls back to the raw fetch).
3. **Script** — the article content plus your org settings (brand name, tone, target length) go to OpenAI, which returns a spoken script **and** a social caption (structured output).
4. **Voice** — the script goes through TTS on fal.ai (MiniMax Speech-02 by default; presenter-specific preset voice).
5. **Video** — audio + presenter image go to [Veed Fabric 1.0 via fal.ai](https://fal.ai/models/veed/fabric-1.0/api), which renders the talking-head MP4.
6. **Library & publish** — every generated item lands in the media library with its script and caption. Edit the script and **regenerate** the video, then **post to X / Instagram** (mocked for the demo — shows a success dialog with the post preview).

## Pipeline overview

```
RSS feeds ──► unified feed (sorted by date)
                 │ pick a story + presenter
                 ▼
   fetch article + Tavily Extract ──► DB (content + metadata)
                 │
                 ▼
   OpenAI (structured output) ──► script + caption
                 │
                 ▼
   fal.ai TTS (MiniMax) ──► audio_url ──┐
   presenter image_url ─────────────────┤
                                        ▼
   Veed Fabric 1.0 (fal.ai queue) ──► talking-head MP4
                 │
                 ▼
   Library (edit script ▸ regenerate) ──► Post to X / Instagram (mock)
```

The pipeline is a small state machine (`QUEUED → ENRICHING → SCRIPTING → GENERATING_AUDIO → GENERATING_VIDEO → READY | FAILED`). Each tRPC `media.advance` call runs **one bounded step** so it fits inside a serverless invocation; the browser keeps calling it until the item is terminal. Video rendering is submitted to the fal queue and polled. Generated audio/video stay on fal's CDN (`expiresIn: "never"`), so no separate object storage is needed.

## Integrations

| Service | Purpose | Notes |
|---|---|---|
| RSS feeds | News ingestion | `rss-parser`; manual refresh + stale-on-load (no cron) |
| [Tavily Extract](https://docs.tavily.com/#extract-webpages) | Article enrichment | Markdown content + images; optional |
| OpenAI | Script + caption | `gpt-5.6-terra`, Responses API with zod structured output |
| [fal.ai TTS](https://fal.ai/explore/text-to-speech-apis) | Text → speech | `fal-ai/minimax/speech-02-hd` by default, preset voices per presenter |
| [Veed Fabric 1.0 (fal.ai)](https://fal.ai/models/veed/fabric-1.0/api) | Video generation | `image_url` + `audio_url` + `resolution` → MP4 |
| X / Instagram | Publishing | Mocked behind a `Publisher` interface (`src/server/lib/publish.ts`) |

## Tech stack

[T3 Stack](https://create.t3.gg/) — Next.js 15 (App Router), tRPC 11, Prisma 6 + Postgres, Tailwind 4, shadcn/ui (Base UI), TanStack Query. Hosted on Vercel; Postgres on Railway.

```
src/
  app/(app)/            feed, library, library/[id], settings (RSC pages + client components)
  app/login/            password gate (server action + signed cookie)
  middleware.ts         redirects to /login unless the session cookie verifies
  server/pipeline.ts    generation state machine
  server/lib/           rss, article-fetch, tavily, openai, fal, publish
  server/api/routers/   source, folder, article, media, presenter, config, publish
prisma/schema.prisma    OrgConfig, Presenter, Folder, Source, Article, MediaItem, Publication
prisma/seed.ts          4 presenters, 5 feeds, default config
```

## Local development

```bash
pnpm install
cp .env.example .env          # fill in values (see below)
./start-database.sh           # local Postgres via Docker (or point DATABASE_URL at Railway)
pnpm db:push                  # create tables
pnpm db:seed                  # presenters, feeds, org config
pnpm dev
```

Then open http://localhost:3000 and sign in with `APP_PASSWORD`.

### Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `APP_PASSWORD` | yes | Shared password for the login gate |
| `AUTH_SECRET` | yes | ≥16 chars; signs the session cookie (`openssl rand -base64 32`) |
| `OPENAI_API_KEY` | for generation | Script + caption |
| `TAVILY_API_KEY` | optional | Richer article extraction; falls back to raw fetch |
| `FAL_KEY` | for generation | TTS + Fabric video |

The app boots without the third-party keys; a generation will fail at the first step that needs a missing key, with the error shown on the item (and a Retry button).

## Deploy (Vercel + Railway)

1. Create a Postgres on Railway; copy its public `DATABASE_URL`.
2. Import the repo on Vercel, set all env vars above.
3. Build runs `prisma generate` via `postinstall`. Apply the schema once: `DATABASE_URL=... pnpm db:push && pnpm db:seed` from your machine (or add `prisma migrate deploy` to the build once you start using migrations).

## Status

MVP implemented: feed, sources, pipeline, library, regenerate, mocked publishing, settings, password gate. Not yet done: real X/Instagram adapters, presenter upload, multi-user auth.
