import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const shiftsRouter = createTRPCRouter({
  getAllBySchedule: privateProcedure
	.input(
		z.object({
			scheduleId: z.string({ required_error: "Store is required" }),
		})
	)
	.query(({ ctx, input }) => {
    return ctx.prisma.shift.findMany({
      where: {
        userId: ctx.currentUserId,
				scheduleId: input.scheduleId,
      },
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        employeeId: z.string({ required_error: "Employee is required" }),
        scheduleId: z.string({ required_error: "Schedule is required" }),
        dayOfWeek: z.number({ required_error: "Day of week is required" }),
				startTime: z.date({ required_error: "Start time is required" }),
				endTime: z.date({ required_error: "End time is required" }),
				notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.shift.create({
        data: {
          ...input,
          userId: ctx.currentUserId,
        },
      });

      return store;
    }),
});
