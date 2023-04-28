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
import { useRouter } from "next/router";
import { H1, H2, H3, H4 } from "~/components/typography";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";

const Store: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const user = useUser();

  if (!id || Array.isArray(id)) {
    return <div>404</div>;
  }

  const { data: store, isLoading: isStoreLoading } =
    api.stores.getById.useQuery({ id });

  const { data: employees, isLoading: isEmployeesLoading } =
    api.employees.getAll.useQuery({ storeId: id });

  if (isStoreLoading || isEmployeesLoading) return <div>Loading...</div>;
  if (!store || !employees) return <div>Something went wrong!</div>;

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
      <main className="mx-auto max-w-3xl px-2">
        <H1>
          {store.storeNumber} · {store.name}
        </H1>
        <Badge>{store.location}</Badge>
        <div className="mt-7 flex items-center justify-between">
          <H2>Employees</H2>
          <CreateEmployeeWizard />
        </div>
        <div className="my-3 w-full overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Name
                </th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((employee) => (
                <tr
                  key={employee.id}
                  className="m-0 border-t p-0 even:bg-muted"
                >
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    {/* <Link href={`/store/${employee.id}`}>{store.name}</Link> */}
                    {employee.name}
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

export default Store;

const initialEmployeeState = {
  employeeNumber: "",
  name: "",
  storeId: "",
};
function CreateEmployeeWizard() {
  const [newEmployee, setNewEmployee] = useState(initialEmployeeState);
  const { data: stores, isLoading: isStoresLoading } =
    api.stores.getAll.useQuery();

  const ctx = api.useContext();
  const { mutate } = api.employees.create.useMutation({
    onSuccess: () => {
      setNewEmployee(initialEmployeeState);
      void ctx.employees.getAll.invalidate();
    },
  });

  if (isStoresLoading) return <div />;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Employee
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
            <Label htmlFor="employeeNumber">Employee Number</Label>
            <Input
              type="number"
              id="employeeNumber"
              name="employeeNumber"
              value={newEmployee.employeeNumber}
              onChange={(e) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  employeeNumber: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="storeId">Store</Label>
            <Select
              name="storeId"
              value={newEmployee.storeId}
              onValueChange={(value) =>
                setNewEmployee((prev) => ({
                  ...prev,
                  storeId: value,
                }))
              }
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
            onClick={() =>
              mutate({
                employeeNumber: Number(newEmployee.employeeNumber),
                name: newEmployee.name,
                storeId: newEmployee.storeId,
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
