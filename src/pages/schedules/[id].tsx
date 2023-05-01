import { Plus } from "lucide-react";
import { type NextPage } from "next";
import { RouterOutputs, api } from "~/utils/api";
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

const Schedule: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

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
                    const startTime = formatDateToDisplayTime(shift.startTime);
                    const endTime = formatDateToDisplayTime(shift.endTime);
                    return (
                      <td
                        key={schedule.id + employee.id + String(date.getDay())}
                        className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right"
                      >
                        <div className="w-36 text-sm">
                          <div>
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
                      <CreateShiftWizard
                        employee={{ ...employee, store: schedule.store }}
                        schedule={schedule}
                        date={date}
                      />
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

type Employee = RouterOutputs["employees"]["getAll"][number];
type Schedule = RouterOutputs["schedules"]["getAll"][number];
const initialShiftState = {
  startTime: "",
  endTime: "",
  notes: "",
};
function CreateShiftWizard({
  employee,
  schedule,
  date,
}: {
  employee: Employee;
  schedule: Schedule;
  date: Date;
}) {
  const [newShift, setNewShift] = useState(initialShiftState);

  const ctx = api.useContext();
  const { mutate } = api.shifts.create.useMutation({
    onSuccess: () => {
      setNewShift(initialShiftState);
      void ctx.schedules.getById.invalidate();
    },
  });

  const { store } = employee;

  return (
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
            <p>
              {store.name} · {store.location}
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
                  `${format(date, "yyyy-MM-dd")}T${newShift.startTime}:00`
                ),
                endTime: new Date(
                  `${format(date, "yyyy-MM-dd")}T${newShift.endTime}:00`
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
  );
}

function formatDateToDisplayTime(date: Date) {
  let time;
  if (date.getMinutes() === 0) {
    time = format(date, "ha");
  } else {
    time = format(date, "h:mma");
  }
  return time;
}

export default Schedule;
