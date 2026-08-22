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
    key: "zach",
    name: "Zach",
    imageUrl: "/presenters/zach.jpg",
  },
  {
    key: "ty",
    name: "Ty",
    imageUrl: "/presenters/ty.jpg",
  },
  {
    key: "eliska",
    name: "Eliska",
    imageUrl: "/presenters/eliska.jpg",
  },
  {
    key: "maya",
    name: "Maya Chen",
    imageUrl: "/presenters/gpt1.png",
  },
  {
    key: "daniel",
    name: "Daniel Okafor",
    imageUrl: "/presenters/gpt2.png",
  },
  {
    key: "sofia",
    name: "Sofia Reyes",
    imageUrl: "/presenters/gpt3.png",
  },
  {
    key: "james",
    name: "James Whitfield",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1024&q=80&fit=crop",
  },
];

const FOLDERS = ["World", "Tech"] as const;

const SOURCES: {
  name: string;
  feedUrl: string;
  siteUrl: string;
  folder: (typeof FOLDERS)[number];
}[] = [
  {
    name: "BBC News — World",
    feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    siteUrl: "https://www.bbc.com/news",
    folder: "World",
  },
  {
    name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    siteUrl: "https://www.theverge.com",
    folder: "Tech",
  },
  {
    name: "TechCrunch",
    feedUrl: "https://techcrunch.com/feed/",
    siteUrl: "https://techcrunch.com",
    folder: "Tech",
  },
  {
    name: "The Guardian — World",
    feedUrl: "https://www.theguardian.com/world/rss",
    siteUrl: "https://www.theguardian.com/world",
    folder: "World",
  },
  {
    name: "Ars Technica",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    siteUrl: "https://arstechnica.com",
    folder: "Tech",
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
          imageUrl: p.imageUrl,
          sortOrder: i,
        },
        update: {
          name: p.name,
          imageUrl: p.imageUrl,
          sortOrder: i,
        },
      }),
    );
  }

  const folderIds = new Map<string, string>();
  for (const [i, name] of FOLDERS.entries()) {
    const f = await db.folder.upsert({
      where: { name },
      create: { name, sortOrder: i },
      update: { sortOrder: i },
    });
    folderIds.set(name, f.id);
  }

  for (const { folder, ...s } of SOURCES) {
    const folderId = folderIds.get(folder)!;
    await db.source.upsert({
      where: { feedUrl: s.feedUrl },
      create: { ...s, folderId },
      update: { name: s.name, siteUrl: s.siteUrl },
    });
    // File never-filed sources; don't override a folder the user chose.
    await db.source.updateMany({
      where: { feedUrl: s.feedUrl, folderId: null },
      data: { folderId },
    });
  }

  await db.orgConfig.upsert({
    where: { id: "default" },
    create: { id: "default", defaultPresenterId: presenters[0]!.id },
    update: {},
  });

  console.log(
    `Seeded ${presenters.length} presenters, ${FOLDERS.length} folders, ${SOURCES.length} sources, org config.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
