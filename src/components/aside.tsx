import {
  CalendarPlus,
  Clock4,
  LayoutDashboard,
  LogOut,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";

const Aside = () => {
  return (
    <div className="hidden md:block">
      <aside className="absolute left-0 top-0 h-screen w-56 bg-muted">
        <nav className="flex h-screen flex-col justify-between">
          <div className="mx-auto flex w-44 flex-col items-center gap-7">
            <div className="flex items-center mt-10 mb-5">
              <CalendarPlus className="mr-2" />
            </div>
            <Link href="/" className="flex items-center">
              <LayoutDashboard className="mr-2" />
              <span className="inline-block w-24 font-bold">Dashboard</span>
            </Link>
            <Link href="/schedules" className="flex items-center">
              <Clock4 className="mr-2" />
              <span className="inline-block w-24 font-bold">Schedules</span>
            </Link>
            <Link href="/stores" className="flex items-center">
              <Store className="mr-2" />
              <span className="inline-block w-24 font-bold">Stores</span>
            </Link>
            <Link href="/employees" className="flex items-center">
              <Users className="mr-2" />
              <span className="inline-block w-24 font-bold">Employees</span>
            </Link>
          </div>
          <div className="mx-auto mb-5 flex w-44 flex-col items-center">
            <div className="flex items-center">
              <LogOut className="mr-2" />
              <span className="inline-block w-24 font-bold">Logout</span>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default Aside;
