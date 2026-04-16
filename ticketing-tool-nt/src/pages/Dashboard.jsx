import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  PlusCircle,
  List,
  FileExclamationPoint,
  TrendingUp,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

import EmployeeBarChart from "../components/Charts/EmployeeBarChart";
import EmployeeDoughnutChart from "../components/Charts/EmployeeDoughnutChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const role = user?.type?.toLowerCase();

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const menuItems = [
    {
      title: "Create Ticket",
      description: "Raise a new support ticket",
      icon: PlusCircle,
      color: "from-green-500 to-emerald-600",
      route: "/newticket",
      hideFor: ["employee"],
    },
    {
      title: "All Tickets",
      description: "View and manage all tickets",
      icon: List,
      color: "from-indigo-500 to-blue-600",
      route: "/alltickets",
    },
    {
      title: "Critical Tickets",
      description: "High priority issues",
      icon: FileExclamationPoint,
      color: "from-red-500 to-rose-600",
      route: "/criticaltickets",
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.hideFor?.includes(role)
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 px-3 animate-fadeIn">
      <div className="max-w-6xl mx-auto">

        {/* ================= HEADER (MenuPage style) ================= */}
        <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3">

  {/* background blobs (match smaller size) */}
  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
  <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-cyan-500/10 to-teal-500/10 rounded-full blur-xl"></div>

  <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">

    {/* LEFT */}
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm">
        <LayoutDashboard className="h-5 w-5 text-white" />
      </div>

      <div>
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Manage tickets and monitor system activity
        </p>
      </div>
    </div>

  </div>
</div>

        {/* ================= CARDS ================= */}
        <div className="flex flex-wrap gap-2 justify-start animate-slideUp">

  {filteredItems.map((item, index) => {
    const Icon = item.icon;

    return (
      <div
        key={index}
        onClick={() => navigate(item.route)}
        className="group cursor-pointer w-[180px]"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="
          bg-white dark:bg-gray-800
          rounded-lg border border-gray-200 dark:border-gray-700
          shadow-sm hover:shadow-md hover:scale-[1.02]
          transition-all duration-300
        ">

          <div className="p-2.5 flex flex-col gap-1.5">

            {/* ICON (smaller) */}
            <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
              <Icon className="w-4 h-4" />
            </div>

            {/* TITLE */}
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
              {item.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              {item.description}
            </p>

            {/* ARROW */}
            <div className="flex justify-end text-blue-600 dark:text-blue-400">
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>

          </div>
        </div>
      </div>
    );
  })}
</div>

        {/* ================= CHARTS (kept same) ================= */}
        <div className="mt-6 animate-slideUp">

          <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3">

  {/* background blobs */}
  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
  <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-cyan-500/10 to-teal-500/10 rounded-full blur-xl"></div>

  <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">

    {/* LEFT */}
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm">
        <TrendingUp className="h-5 w-5 text-white" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Employee Ticket Stats
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Overview of ticket distribution
        </p>
      </div>
    </div>

  </div>
</div>

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
              <EmployeeBarChart theme={isDarkMode ? "dark" : "light"} />
            </div>

            <div className="w-full lg:w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex items-center justify-center">
              <EmployeeDoughnutChart theme={isDarkMode ? "dark" : "light"} />
            </div>

          </div>

        </div>

      </div>

      {/* ================= ANIMATIONS ================= */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>

    </div>
  );
};

export default Dashboard;