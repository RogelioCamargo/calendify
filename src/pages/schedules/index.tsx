import { CalendarIcon, Plus } from "lucide-react";
import { type NextPage } from "next";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { H1, H2 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import MainLayout from "~/components/layout";
import {
  Table,
  TableBodyData,
  TableBodyRow,
  TableHeadData,
  TableHeadRow,
} from "~/components/ui/table";

const Schedules: NextPage = () => {
  const { data: stores, isLoading: isLoadingStores } =
    api.stores.getAll.useQuery();
  const { data: schedules, isLoading: isLoadingSchedules } =
    api.schedules.getAll.useQuery();

  if (isLoadingStores || isLoadingSchedules) return <div>Loading...</div>;
  if (!stores || !schedules) return <div>Something went wrong!</div>;
  return (
    <MainLayout>
      <H1 className="mb-8 mt-5 md:mt-9">Schedules</H1>
      <div className="flex items-center">
        <CreateScheduleWizard />
      </div>
      <Table>
        <thead>
          <TableHeadRow>
            <TableHeadData>End of Week</TableHeadData>
            <TableHeadData>Store</TableHeadData>
          </TableHeadRow>
        </thead>
        <tbody>
          {schedules?.map((schedule) => {
            const store = stores.find((store) => store.id === schedule.storeId);
            if (!store) return <div>Something went wrong!</div>;

            return (
              <TableBodyRow key={schedule.id}>
                <TableBodyData>
                  <Link href={`/schedules/${schedule.id}`}>
                    {format(schedule.endOfWeekDate, "PPP")}
                  </Link>
                </TableBodyData>
                <TableBodyData>
                  <div>
                    {store.storeNumber} · {store.name}
                  </div>
                  <Badge>{store.location}</Badge>
                </TableBodyData>
              </TableBodyRow>
            );
          })}
        </tbody>
      </Table>
    </MainLayout>
  );
};

export default Schedules;

function CreateScheduleWizard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [store, setStore] = useState<string>("");

  const { data: stores, isLoading: isStoresLoading } =
    api.stores.getAll.useQuery();

  const ctx = api.useContext();
  const { mutate } = api.schedules.create.useMutation({
    onSuccess: () => {
      setDate(new Date());
      setStore("");
      void ctx.schedules.getAll.invalidate();
    },
  });

  if (isStoresLoading) return <div />;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create schedule</DialogTitle>
          <DialogDescription>
            Add a new schedule for your store.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="endOfWeekDate">End of Week</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="storeId">Store</Label>
            <Select
              name="storeId"
              value={store}
              onValueChange={(value) => setStore(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
                <SelectContent position="popper">
                  {stores?.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.storeNumber} - {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!date || !store) return;

              mutate({
                endOfWeekDate: date,
                storeId: store,
              });
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
