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
import { Input } from "~/components/ui/input";
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
import {
  Table,
  TableBodyData,
  TableBodyRow,
  TableHeadData,
  TableHeadRow,
} from "~/components/ui/table";
import MainLayout from "~/components/layout";

const AuthenticatedApp: NextPage = () => {
  const { data: stores, isLoading: isLoadingStores } =
    api.stores.getAll.useQuery();
  const { data: schedules, isLoading: isLoadingSchedules } =
    api.schedules.getAll.useQuery();

  if (isLoadingStores || isLoadingSchedules) return <div>Loading...</div>;
  if (!stores || !schedules) return <div>Something went wrong!</div>;
  return (
    <MainLayout>
      <H1 className="mb-8 mt-5 md:mt-9">Dashboard</H1>
      <div className="flex items-center justify-between">
        <H2>Schedules</H2>
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
      <div className="mt-5 flex items-center justify-between">
        <H2>Stores</H2>
        <CreateStoreWizard />
      </div>
      <Table>
        <thead>
          <TableHeadRow>
            <TableHeadData>ID</TableHeadData>
            <TableHeadData>Name</TableHeadData>
            <TableHeadData>Location</TableHeadData>
          </TableHeadRow>
        </thead>
        <tbody>
          {stores?.map((store) => (
            <TableBodyRow key={store.id}>
              <TableBodyData>
                <Link href={`/stores/${store.id}`}>{store.storeNumber}</Link>
              </TableBodyData>
              <TableBodyData>
                <Link href={`/stores/${store.id}`}>{store.name}</Link>
              </TableBodyData>
              <TableBodyData>{store.location}</TableBodyData>
            </TableBodyRow>
          ))}
        </tbody>
      </Table>
    </MainLayout>
  );
};

export default AuthenticatedApp;

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

const initialStoreState = {
  storeNumber: "",
  name: "",
  location: "",
};
function CreateStoreWizard() {
  const [newStore, setNewStore] = useState(initialStoreState);

  const ctx = api.useContext();
  const { mutate } = api.stores.create.useMutation({
    onSuccess: () => {
      setNewStore(initialStoreState);
      void ctx.stores.getAll.invalidate();
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Store
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create store</DialogTitle>
          <DialogDescription>
            Add a new store to make schedules and create employees.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="storeNumber">Store Number</Label>
            <Input
              type="number"
              id="storeNumber"
              value={newStore.storeNumber}
              onChange={(e) =>
                setNewStore((prev) => ({
                  ...prev,
                  storeNumber: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={newStore.name}
              onChange={(e) =>
                setNewStore((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              value={newStore.location}
              onChange={(e) =>
                setNewStore((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            onClick={() =>
              mutate({
                storeNumber: Number(newStore.storeNumber),
                name: newStore.name,
                location: newStore.location,
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
