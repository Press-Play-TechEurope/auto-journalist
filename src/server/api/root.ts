import { articleRouter } from "~/server/api/routers/article";
import { configRouter } from "~/server/api/routers/config";
import { mediaRouter } from "~/server/api/routers/media";
import { presenterRouter } from "~/server/api/routers/presenter";
import { publishRouter } from "~/server/api/routers/publish";
import { sourceRouter } from "~/server/api/routers/source";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  source: sourceRouter,
  article: articleRouter,
  media: mediaRouter,
  presenter: presenterRouter,
  config: configRouter,
  publish: publishRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.media.list();
 */
export const createCaller = createCallerFactory(appRouter);
