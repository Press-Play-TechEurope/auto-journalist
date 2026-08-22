import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TTS_PROVIDERS, VOICES, voicesFor } from "~/server/voices";

export const voiceRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ provider: z.enum(TTS_PROVIDERS).optional() }).optional())
    .query(({ input }) =>
      input?.provider ? voicesFor(input.provider) : [...VOICES],
    ),
});
