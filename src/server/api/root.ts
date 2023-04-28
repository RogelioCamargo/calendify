import { createTRPCRouter } from "~/server/api/trpc";
import { storesRouter } from "~/server/api/routers/stores";
import { schedulesRouter } from "./routers/schedules";
import { employeesRouter } from "./routers/employees";
import { shiftsRouter } from "./routers/shifts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  schedules: schedulesRouter,
  stores: storesRouter,
  employees: employeesRouter,
	shifts: shiftsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
