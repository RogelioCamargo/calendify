import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const storesRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.store.findMany();
  }),
});