import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const schedulesRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.schedule.findMany({
      where: {
        userId: ctx.currentUserId,
      },
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        endOfWeekDate: z.date({ required_error: "Store number is required" }),
        storeId: z.string({ required_error: "Name is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.schedule.create({
        data: {
          ...input,
          userId: ctx.currentUserId,
        },
      });

      return store;
    }),
});