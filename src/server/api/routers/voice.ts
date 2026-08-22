import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { VOICES } from "~/server/voices";

export const voiceRouter = createTRPCRouter({
  list: publicProcedure.query(() => VOICES),
});
