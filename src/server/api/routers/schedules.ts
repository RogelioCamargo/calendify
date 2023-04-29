import { TRPCError } from "@trpc/server";
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
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.prisma.schedule.findFirst({
        where: {
          id: input.id,
          userId: ctx.currentUserId,
        },
				include: {
					store: {
						include: {
							employees: true,
						}
					},
				}
      });

      if (!schedule) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

			const endOfWeekDate = new Date(
        Date.UTC(
          schedule.endOfWeekDate.getUTCFullYear(),
          schedule.endOfWeekDate.getUTCMonth(),
          schedule.endOfWeekDate.getUTCDate() + 1
        )
      );
			const weekDates = getDates(endOfWeekDate);


      return {
				...schedule,
				weekDates
			};
    }),
  create: privateProcedure
    .input(
      z.object({
        endOfWeekDate: z.date({
          required_error: "End of week date is required",
        }),
        storeId: z.string({ required_error: "Store is required" }),
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

export function getDates(date: Date): Date[] {
  const dates: Date[] = [];

  let currentDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 6)
  );

  while (currentDate <= date) {
    dates.push(new Date(currentDate.getTime()));

    const nextDate = new Date(currentDate.getTime());
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    currentDate = nextDate;
  }

  return dates;
}