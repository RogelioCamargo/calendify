import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const employeesRouter = createTRPCRouter({
  getAll: privateProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.employee.findMany({
        where: {
          userId: ctx.currentUserId,
          storeId: input.storeId,
        },
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        employeeNumber: z.number({
          required_error: "Employee number is required",
        }),
        name: z.string({ required_error: "Name is required" }),
        storeId: z.string({ required_error: "Store is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.employee.create({
        data: {
          ...input,
          userId: ctx.currentUserId,
        },
      });

      return store;
    }),
});
