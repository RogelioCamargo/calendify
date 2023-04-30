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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import MainLayout from "~/components/layout";

const Stores: NextPage = () => {
  const { data: stores, isLoading: isLoadingStores } =
    api.stores.getAll.useQuery();

  if (isLoadingStores) return <div>Loading...</div>;
  if (!stores) return <div>Something went wrong!</div>;
  return (
    <MainLayout>
      <H1 className="mb-8 mt-5 md:mt-9">Stores</H1>
      <div className="flex items-center justify-between">
        <CreateStoreWizard />
      </div>
      <div className="my-3 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                ID
              </th>
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
                  <Link href={`/stores/${store.id}`}>{store.storeNumber}</Link>
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  <Link href={`/stores/${store.id}`}>{store.name}</Link>
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  {store.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default Stores;

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
