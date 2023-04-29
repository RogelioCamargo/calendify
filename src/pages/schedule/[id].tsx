import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, CalendarPlus, Plus } from "lucide-react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { H1, H2, H3 } from "~/components/typography";
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

const Home: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const user = useUser();

  if (!id || Array.isArray(id)) {
    return <div>404</div>;
  }

  const { data: schedule, isLoading: isScheduleLoading } =
    api.schedules.getById.useQuery({ id });

  if (isScheduleLoading) return <div>Loading...</div>;
  if (!schedule) return <div>Something went wrong!</div>;

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

  // console.log(schedule.endOfWeekDate);
  // console.log(schedule.weekDates);

  return (
    <>
      <Head>
        <title>Calendify</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="mx-auto max-w-7xl px-2 py-5">
        <div className="flex justify-between">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <CalendarPlus />
              <span className="text-xl font-bold">Calendify</span>
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
      <main className="mx-auto max-w-7xl px-2">
        <H1>{format(schedule.endOfWeekDate, "E MMM dd yyyy")}</H1>
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
                    className="border px-4 py-2 text-center font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                  >
                    {format(date, "E MMM dd yyyy")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.store.employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="m-0 border-t p-0 even:bg-muted"
                >
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    {employee.name}
                  </td>
                  <td className="border px-4 py-2 w-40 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost">
                          <Plus className="mr-2 h-4 w-4" /> Shift
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>New Shift</DialogTitle>
                          <DialogDescription>
														<p>{employee.name}</p>
														{/* <p>{format()}</p> */}
                            <p>{schedule.store.name} · {schedule.store.location}</p>
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
                              />
                            </div>
                            <div className="flex w-full flex-col space-y-1.5">
                              <Label htmlFor="endTime">End Time</Label>
                              <Input type="time" name="endTime" id="endTime" />
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              placeholder="Add any notes here."
                            />
                          </div>
                        </form>
                        <DialogFooter>
                          <Button type="submit">Submit</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>
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
