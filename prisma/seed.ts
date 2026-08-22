/**
 * Seed: presenters, RSS sources, and the default OrgConfig.
 * Idempotent — safe to re-run (upserts by stable keys).
 *
 *   pnpm db:seed
 */
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

const PRESENTERS = [
  {
    key: "maya",
    name: "Maya Chen",
    bio: "Lead anchor. Measured, authoritative delivery.",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1024&q=80&fit=crop",
    voiceId: "Wise_Woman",
  },
  {
    key: "daniel",
    name: "Daniel Okafor",
    bio: "Evening news. Deep, steady voice.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&q=80&fit=crop",
    voiceId: "Deep_Voice_Man",
  },
  {
    key: "sofia",
    name: "Sofia Reyes",
    bio: "Tech & culture desk. Warm and upbeat.",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1024&q=80&fit=crop",
    voiceId: "Calm_Woman",
  },
  {
    key: "james",
    name: "James Whitfield",
    bio: "Business correspondent. Crisp and direct.",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1024&q=80&fit=crop",
    voiceId: "Patient_Man",
  },
];

const SOURCES = [
  {
    name: "BBC News — World",
    feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    siteUrl: "https://www.bbc.com/news",
  },
  {
    name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    siteUrl: "https://www.theverge.com",
  },
  {
    name: "TechCrunch",
    feedUrl: "https://techcrunch.com/feed/",
    siteUrl: "https://techcrunch.com",
  },
  {
    name: "The Guardian — World",
    feedUrl: "https://www.theguardian.com/world/rss",
    siteUrl: "https://www.theguardian.com/world",
  },
  {
    name: "Ars Technica",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    siteUrl: "https://arstechnica.com",
  },
];

async function main() {
  // Presenters — stable ids derived from key so re-seeding doesn't duplicate.
  const presenters = [];
  for (const [i, p] of PRESENTERS.entries()) {
    const id = `presenter_${p.key}`;
    presenters.push(
      await db.presenter.upsert({
        where: { id },
        create: {
          id,
          name: p.name,
          bio: p.bio,
          imageUrl: p.imageUrl,
          voiceId: p.voiceId,
          sortOrder: i,
        },
        update: {
          name: p.name,
          bio: p.bio,
          imageUrl: p.imageUrl,
          voiceId: p.voiceId,
          sortOrder: i,
        },
      }),
    );
  }

  for (const s of SOURCES) {
    await db.source.upsert({
      where: { feedUrl: s.feedUrl },
      create: s,
      update: { name: s.name, siteUrl: s.siteUrl },
    });
  }

  await db.orgConfig.upsert({
    where: { id: "default" },
    create: { id: "default", defaultPresenterId: presenters[0]!.id },
    update: {},
  });

  console.log(
    `Seeded ${presenters.length} presenters, ${SOURCES.length} sources, org config.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
