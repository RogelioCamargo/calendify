import { Plus } from "lucide-react";
import { type NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { H1 } from "~/components/typography";
import { Button } from "~/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";
import { Badge } from "~/components/ui/badge";
import MainLayout from "~/components/layout";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBodyData,
  TableBodyRow,
  TableHeadData,
  TableHeadRow,
} from "~/components/ui/table";

const Employees: NextPage = () => {
  const { data: employees, isLoading: isLoadingEmployees } =
    api.employees.getAll.useQuery();

  if (isLoadingEmployees) return <div>Loading...</div>;
  if (!employees) return <div>Something went wrong!</div>;

  return (
    <MainLayout>
      <H1 className="mb-8 mt-5 md:mt-9">Employees</H1>
      <div className="flex items-center">
        <CreateEmployeeWizard />
      </div>
      <Table>
        <thead>
          <TableHeadRow>
            <TableHeadData>ID</TableHeadData>
            <TableHeadData>Name</TableHeadData>
            <TableHeadData>Store</TableHeadData>
          </TableHeadRow>
        </thead>
        <tbody>
          {employees?.map((employee) => {
            const { store } = employee;
            return (
              <TableBodyRow key={employee.id}>
                <TableBodyData>
                  <Link href={`/employees/${employee.id}`}>
                    {employee.employeeNumber}
                  </Link>
                </TableBodyData>
                <TableBodyData>{employee.name}</TableBodyData>
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

export default Employees;

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
          <DialogDescription>Add a new employee to a store.</DialogDescription>
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
