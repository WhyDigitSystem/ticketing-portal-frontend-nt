import { clsx } from "clsx";
import {
  LayoutDashboard,
  Settings2,
  Tag,
  IdCardLanyard,
  SquareUser,
  Clipboard 
} from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);

  // get role safely (handles undefined, spaces, case issues)
  const role = user?.type?.trim().toLowerCase() || "";

  // navigation with role access
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      roles: ["admin", "employee"],
    },
    {
      name: "Ticket",
      href: "/menu/ticket",
      icon: Tag,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      roles: ["admin", "employee"],
    },
    {
      name: "Employee",
      href: "/menu/employee",
      icon: IdCardLanyard,
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      roles: ["admin"],
    },
    {
      name: "Customer",
      href: "/menu/customer",
      icon: SquareUser,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      roles: ["admin"],
    },
    {
      name: "Settings",
      href: "/menu/settings",
      icon: Settings2,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      roles: ["admin"],
    },
  ];

  // filter based on role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  // prevent render before user loads
  if (!user) return null;

  return (
    <aside
      className={clsx(
        "bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300",
        sidebarOpen ? "w-[170px]" : "w-20",
        "flex-shrink-0 flex flex-col h-full"
      )}
    >
      {/* Navigation */}
      <div className="mt-2 flex-1 px-1.5 space-y-0.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex items-center border transition-all duration-200 group relative",
                  isActive
                    ? `border-blue-200 dark:border-blue-800 ${item.bgColor} ${item.color}`
                    : `border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`,
                  sidebarOpen ? "px-2 py-1.5 rounded-md" : "p-1 rounded-full justify-center"
                )
              }
            >
              <div
                className={clsx(
                  "rounded-md transition-colors duration-200",
                  sidebarOpen
                    ? `${item.bgColor} p-1.5`
                    : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800 p-1.5"
                )}
              >
                <Icon
                  className={clsx(
                    "h-4 w-4",
                    sidebarOpen
                      ? item.color
                      : "group-hover:text-gray-900 dark:group-hover:text-white"
                  )}
                />
              </div>

              {sidebarOpen && (
                <span className="ml-2.5 text-sm font-medium">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      {sidebarOpen && (
        <div className="px-2 py-1 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500">
          Beta v1.0
        </div>
      )}
    </aside>
  );
};

export default Sidebar;