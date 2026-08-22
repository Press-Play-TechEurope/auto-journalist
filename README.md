# auto-journalist

> https://auto-journalist.vercel.app/

AI Newsroom — aggregate RSS news, enrich articles with AI, and turn them into talking-head videos ready for social media.

## What it does

auto-journalist is a web app that watches multiple news sources, helps you pick a story, and produces a short presenter-style video from it:

1. **Aggregate** — add any number of RSS feeds as sources. The app polls them, fetches new items, and shows a unified feed sorted by date, with stories from all sources interleaved.
2. **Enrich** — click a news item to process it:
   - The article is downloaded with a simple HTTP fetch.
   - [Tavily Extract](https://docs.tavily.com/#extract-webpages) pulls structured context from the article URL — the gist, photos, and other metadata — which is stored in the database alongside the article.
3. **Script** — the stored article content and metadata are sent to OpenAI to generate a spoken-word script for a news video.
4. **Video** — the script and a reference image (the talking-head presenter) are handed to [Veed Fabric 1.0 via fal.ai](https://fal.ai/models/veed/fabric-1.0/api), which generates the video.
5. **Publish** — the finished video can be posted to social media (X / Instagram).

## Pipeline overview

```
RSS feeds ──► unified feed (sorted by date)
                 │ click a story
                 ▼
        fetch article + Tavily Extract ──► DB (content + metadata)
                 │
                 ▼
        OpenAI ──► video script
                 │
                 ▼
        TTS (script ──► audio) + reference image
                 │
                 ▼
        Veed Fabric 1.0 (fal.ai) ──► talking-head video
                 │
                 ▼
        Post to X / Instagram
```

## Integrations

| Service | Purpose | Notes |
|---|---|---|
| RSS feeds | News ingestion | Multiple sources, polled periodically |
| [Tavily Extract](https://docs.tavily.com/#extract-webpages) | Article enrichment | Structured context: gist, images, metadata |
| OpenAI | Script generation | Turns article + metadata into a video script |
| [Veed Fabric 1.0 (fal.ai)](https://fal.ai/models/veed/fabric-1.0/api) | Video generation | Input: `image_url` + `audio_url` + `resolution` (480p/720p); output: MP4 |
| X / Instagram APIs | Publishing | Post the generated video |

> **Note:** Veed Fabric takes an image and an **audio** file, not text — so the generated script goes through a text-to-speech step first (details to be decided during implementation).

## Status

Design phase — implementation starts next. Stack, database schema, and project layout are still to be decided.

## Tech Stack

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)


## How do I deploy this?

Follow our deployment guides for [Railway](https://create.t3.gg/en/other-recs#railway).
