import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { CalendarIcon, Plus, LogOut, CalendarPlus } from "lucide-react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { H1, H2 } from "~/components/typography";
import { Badge } from "~/components/ui/badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const CreateScheduleWizard = () => {
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
};

const initialStoreState = {
  storeNumber: "",
  name: "",
  location: "",
};
const CreateStoreWizard = () => {
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
};

const Home: NextPage = () => {
  const { data: stores, isLoading: isLoadingStores } =
    api.stores.getAll.useQuery();
  const { data: schedules, isLoading: isLoadingSchedules } =
    api.schedules.getAll.useQuery();

  const user = useUser();

  if (!user.isSignedIn) {
    return (
      <>
        <Head>
          <title>Calendify</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="align-items flex h-screen w-screen justify-center">
          <SignInButton />
        </div>
      </>
    );
  }
  if (isLoadingStores || isLoadingSchedules) return <div>Loading...</div>;
  if (!stores || !schedules) return <div>Something went wrong!</div>;
  return (
    <>
      <Head>
        <title>Calendify</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="mx-auto max-w-3xl px-2 py-5">
        <div className="flex justify-between">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <CalendarPlus />
              <span className="text-xl font-semibold">Calendify</span>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Profile image"
                />
                <AvatarFallback>PI</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <SignOutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-2">
        {!user.isSignedIn && <SignInButton />}
        <H1 className="mb-10 mt-2">Dashboard</H1>
        <div className="mt-5 flex justify-between">
          <H2>Schedules</H2>
          <CreateScheduleWizard />
        </div>
        <div className="my-3 w-full overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  End of Week
                </th>
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Store
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules?.map((schedule) => {
                const store = stores.find(
                  (store) => store.id === schedule.storeId
                );
                if (!store) return <div>Something went wrong!</div>;

                return (
                  <tr
                    key={schedule.id}
                    className="m-0 border-t p-0 even:bg-muted"
                  >
                    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <Link href={`/schedule/${schedule.id}`}>
                        {format(schedule.endOfWeekDate, "PPP")}
                      </Link>
                    </td>
                    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {store.name} · {store.location}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex justify-between">
          <H2>Stores</H2>
          <CreateStoreWizard />
        </div>
        <div className="my-3 w-full overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Name
                </th>
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {stores?.map((store) => (
                <tr key={store.id} className="m-0 border-t p-0 even:bg-muted">
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    <Link href={`/store/${store.id}`}>{store.name}</Link>
                  </td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    {store.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Home;
