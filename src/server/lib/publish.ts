import { type Platform } from "../../../generated/prisma";

export type PublishInput = {
  mediaItemId: string;
  videoUrl: string;
  caption: string;
};

export type PublishResult = { externalUrl: string };

export interface Publisher {
  platform: Platform;
  publish(input: PublishInput): Promise<PublishResult>;
}

/**
 * Demo publishers: simulate a successful post and return a plausible URL.
 * Swap for real X / Instagram Graph API adapters behind the same interface.
 */
const fakeId = (seed: string) =>
  Array.from(seed)
    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
    .toString(36) + Date.now().toString(36);

export const xPublisher: Publisher = {
  platform: "X",
  async publish({ mediaItemId }) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      externalUrl: `https://x.com/autojournalist/status/${fakeId(mediaItemId)}`,
    };
  },
};

export const instagramPublisher: Publisher = {
  platform: "INSTAGRAM",
  async publish({ mediaItemId }) {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      externalUrl: `https://www.instagram.com/reel/${fakeId(mediaItemId).slice(0, 11)}/`,
    };
  },
};

export const publishers: Record<Platform, Publisher> = {
  X: xPublisher,
  INSTAGRAM: instagramPublisher,
};
