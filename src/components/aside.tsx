import {
  CalendarPlus,
  Clock4,
  LayoutDashboard,
  Store,
  Users,
} from "lucide-react";

const Aside = () => {
  return (
    <aside className="absolute left-0 top-0 h-screen w-60 bg-muted">
      <nav className="mx-auto flex w-44 flex-col items-center gap-7">
        <div className="flex items-center p-5">
          <CalendarPlus className="mr-2" />
        </div>
        <div className="flex items-center">
          <LayoutDashboard className="mr-2" />
          <span className="inline-block w-24 font-bold">Dashboard</span>
        </div>
        <div className="flex items-center">
          <Clock4 className="mr-2" />
          <span className="inline-block w-24 font-bold">Schedules</span>
        </div>
        <div className="flex items-center">
          <Store className="mr-2" />
          <span className="inline-block w-24 font-bold">Stores</span>
        </div>
        <div className="flex items-center">
          <Users className="mr-2" />
          <span className="inline-block w-24 font-bold">Employees</span>
        </div>
      </nav>
    </aside>
  );
};

export default Aside;
