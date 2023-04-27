import { createTRPCRouter } from "~/server/api/trpc";
import { storesRouter } from "~/server/api/routers/stores";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  stores: storesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
