import { TRPCError } from "@trpc/server";
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
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findFirst({
        where: {
          id: input.id,
          userId: ctx.currentUserId,
        },
      });

      if (!store) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return store;
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
