import { Plus } from "lucide-react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { H1, H2 } from "~/components/typography";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/router";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useState } from "react";
import MainLayout from "~/components/layout";

const initialShiftState = {
  startTime: "",
  endTime: "",
  notes: "",
};
const Schedule: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [newShift, setNewShift] = useState(initialShiftState);

  const ctx = api.useContext();
  const { mutate } = api.shifts.create.useMutation({
    onSuccess: () => {
      setNewShift(initialShiftState);
      void ctx.schedules.getById.invalidate();
    },
  });

  if (!id || Array.isArray(id)) {
    return <div>404</div>;
  }

  const { data: schedule, isLoading: isScheduleLoading } =
    api.schedules.getById.useQuery({ id });

  if (isScheduleLoading) return <div>Loading...</div>;
  if (!schedule) return <div>Something went wrong!</div>;

  return (
    <MainLayout>
      <H1 className="mt-5 md:mt-9">
        {format(schedule.endOfWeekDate, "E MMM dd yyyy")}
      </H1>
      <H2>
        {schedule.store.storeNumber} · {schedule.store.name}
      </H2>
      <Badge>{schedule.store.location}</Badge>
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Employee
              </th>
              {schedule.weekDates.map((date) => (
                <th
                  key={date.toString()}
                  className="w-44 border px-4 py-2 text-center font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                >
                  {format(date, "E MMM dd yyyy")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.store.employees.map((employee) => (
              <tr key={employee.id} className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  {employee.name}
                </td>
                {schedule.weekDates.map((date) => {
                  const shift =
                    schedule.shiftsByEmployeeId[employee.id]![date.getDay()];
                  if (shift) {
                    let startTime, endTime;
                    if (shift.startTime.getMinutes() === 0) {
                      startTime = format(shift.startTime, "ha");
                    } else {
                      startTime = format(shift.startTime, "h:mma");
                    }

                    if (shift.endTime.getMinutes() === 0) {
                      endTime = format(shift.endTime, "ha");
                    } else {
                      endTime = format(shift.endTime, "h:mma");
                    }
                    return (
                      <td
                        key={schedule.id + employee.id + String(date.getDay())}
                        className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right"
                      >
                        <div className="w-32">
                          <div className="grow">
                            {startTime} - {endTime}
                          </div>
                          <div>{shift.notes}</div>
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={schedule.id + employee.id + String(date.getDay())}
                      className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right"
                    >
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="w-32">
                            <Plus className="mr-2 h-4 w-4" /> Shift
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>New Shift</DialogTitle>
                            <DialogDescription>
                              <p>{employee.name}</p>
                              {/* <p>{format()}</p> */}
                              <p>
                                {schedule.store.name} ·{" "}
                                {schedule.store.location}
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                          <form className="grid w-full items-center gap-4">
                            <div className="flex justify-between gap-3">
                              <div className="flex w-full flex-col space-y-1.5">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                  type="time"
                                  name="startTime"
                                  id="startTime"
                                  value={newShift.startTime}
                                  onChange={(e) =>
                                    setNewShift({
                                      ...newShift,
                                      startTime: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex w-full flex-col space-y-1.5">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                  type="time"
                                  name="endTime"
                                  id="endTime"
                                  value={newShift.endTime}
                                  onChange={(e) =>
                                    setNewShift({
                                      ...newShift,
                                      endTime: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Add any notes here."
                                value={newShift.notes}
                                onChange={(e) =>
                                  setNewShift({
                                    ...newShift,
                                    notes: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </form>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={() =>
                                mutate({
                                  startTime: new Date(
                                    `${format(date, "yyyy-MM-dd")}T${
                                      newShift.startTime
                                    }:00`
                                  ),
                                  endTime: new Date(
                                    `${format(date, "yyyy-MM-dd")}T${
                                      newShift.endTime
                                    }:00`
                                  ),
                                  notes: newShift.notes,
                                  employeeId: employee.id,
                                  scheduleId: schedule.id,
                                  dayOfWeek: date.getDay(),
                                })
                              }
                            >
                              Submit
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default Schedule;
