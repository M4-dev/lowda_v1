"use client";

import Link from "next/link";
import Container from "../container";
import AdminNavItem from "./admin-nav-item";
import {
  LayoutDashboard,
  Package,
  List,
  PlusSquare,
  Building2,
  Home,
  Monitor,
  Users,
  LayoutGrid,
} from "lucide-react";
import AdminNotifications from "./admin-notifications";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AdminNav = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user role
    fetch('/api/current-user-role')
      .then(res => res.json())
      .then(data => setUserRole(data.role))
      .catch(() => setUserRole(null));
  }, []);

  const isManager = userRole === "MANAGER";

  return (
    <div className="w-full shadow-xl border-b-[0.5px] bg-slate-300">
      <Container>
        <div className="flex flex-wrap items-center pt-1 justify-start md:justify-start gap-4 md:gap-12 overflow-x-auto">
          <Link href={"/admin"}>
            <AdminNavItem
              label="Summary"
              icon={LayoutDashboard}
              selected={pathname === "/admin"}
            />
          </Link>
          {!isManager && (
            <>
              <Link href={"/admin/add-products"}>
                <AdminNavItem
                  label="Add Products"
                  icon={PlusSquare}
                  selected={pathname === "/admin/add-products"}
                />
              </Link>
              <Link href={"/admin/manage-products"}>
                <AdminNavItem
                  label="Manage Products"
                  icon={Package}
                  selected={pathname === "/admin/manage-products"}
                />
              </Link>
              <Link href={"/admin/manage-orders"}>
                <AdminNavItem
                  label="Manage Orders"
                  icon={List}
                  selected={pathname === "/admin/manage-orders"}
                />
              </Link>
              <Link href={"/admin/manage-users"}>
                <AdminNavItem
                  label="Manage Users"
                  icon={Users}
                  selected={pathname === "/admin/manage-users"}
                />
              </Link>
              <Link href={"/admin/monitor"}>
                <AdminNavItem
                  label="Monitor"
                  icon={Monitor}
                  selected={pathname === "/admin/monitor"}
                />
              </Link>
              <Link href={"/admin/manage-bank-details"}>
                <AdminNavItem
                  label="Bank Details"
                  icon={Building2}
                  selected={pathname === "/admin/manage-bank-details"}
                />
              </Link>
              <Link href={"/admin/manage-hostels"}>
                <AdminNavItem
                  label="Hostels"
                  icon={Home}
                  selected={pathname === "/admin/manage-hostels"}
                />
              </Link>
              <Link href={" /admin/manage-banner"}>
                <AdminNavItem
                  label="Banner"
                  icon={LayoutGrid}
                  selected={pathname === "/admin/manage-banner"}
                />
              </Link>
            </>
          )}
          <div className="ml-auto mr-4">
            <AdminNotifications />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AdminNav;
