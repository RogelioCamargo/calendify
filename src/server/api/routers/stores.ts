import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const storesRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.store.findMany({
      where: {
        userId: ctx.currentUserId,
      },
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        storeNumber: z.number({ required_error: "Store number is required" }),
        name: z.string({ required_error: "Name is required" }),
        location: z.string({ required_error: "Location is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.create({
        data: {
          ...input,
          userId: ctx.currentUserId,
        },
      });

      return store;
    }),
});
