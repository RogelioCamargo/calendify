import { Plus } from "lucide-react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { H1, H2 } from "~/components/typography";
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
import {
  Table,
  TableBodyData,
  TableBodyRow,
  TableHeadData,
  TableHeadRow,
} from "~/components/ui/table";
import MainLayout from "~/components/layout";

const Store: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id || Array.isArray(id)) {
    return <div>404</div>;
  }

  const { data: store, isLoading: isStoreLoading } =
    api.stores.getById.useQuery({ id });

  if (isStoreLoading) return <div>Loading...</div>;
  if (!store) return <div>Something went wrong!</div>;

  return (
    <MainLayout>
      <H1 className="mt-5 md:mt-9">
        {store.storeNumber} · {store.name}
      </H1>
      <Badge>{store.location}</Badge>
      <div className="mt-7 flex items-center justify-between">
        <H2>Employees</H2>
        <CreateEmployeeWizard />
      </div>
      <Table>
        <thead>
          <TableHeadRow>
            <TableHeadData>Name</TableHeadData>
          </TableHeadRow>
        </thead>
        <tbody>
          {store.employees?.map((employee) => (
            <TableBodyRow key={employee.id}>
              <TableBodyData>
                {/* <Link href={`/store/${employee.id}`}>{store.name}</Link> */}
                {employee.name}
              </TableBodyData>
            </TableBodyRow>
          ))}
        </tbody>
      </Table>
    </MainLayout>
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
          <DialogTitle>Create Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to a store.
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
