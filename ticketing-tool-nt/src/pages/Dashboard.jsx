import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Tag,
  Tags,
  FileUser,
  FileExclamationPoint,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import EmployeeBarChart from "../components/Charts/EmployeeBarChart";
import EmployeeDoughnutChart from "../components/Charts/EmployeeDoughnutChart";

const dashboardConfig = {
  title: "Ticket Management",
  description: "Manage and monitor all your support tickets",
  gradient: "from-indigo-500 to-purple-600",
  sections: [
    {
      title: "Ticket Actions",
      description: "Create and manage tickets",
      icon: FolderOpen,
      gradient: "from-blue-500 to-cyan-500",
      color: "blue",
      items: [
        {
          name: "Ticket",
          path: "/newticket",
          icon: Tag,
          color: "orange",
          description: "Create a new ticket",
        },
        {
          name: "Tickets",
          path: "/alltickets",
          icon: Tags,
          color: "orange",
          description: "View all tickets",
        },
      ],
    },
    {
      title: "Monitoring",
      description: "Track ticket status and priority",
      icon: FolderOpen,
      gradient: "from-emerald-500 to-teal-500",
      color: "emerald",
      items: [
        {
          name: "Critical Tickets",
          path: "/criticaltickets",
          icon: FileExclamationPoint,
          color: "red",
          description: "High priority issues",
        },
      ],
    },
  ],
};

const getColorStyles = (color) => {
  const colors = {
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    green: {
      hover: "hover:bg-green-50 dark:hover:bg-green-900/30",
      border: "hover:border-green-300 dark:hover:border-green-600",
      text: "text-green-600 dark:text-green-400",
      iconBg:
        "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800",
    },
    orange: {
      hover: "hover:bg-orange-50 dark:hover:bg-orange-900/30",
      border: "hover:border-orange-300 dark:hover:border-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      iconBg:
        "bg-orange-100 dark:bg-orange-900/40 group-hover:bg-orange-200 dark:group-hover:bg-orange-800",
    },
    red: {
      hover: "hover:bg-red-50 dark:hover:bg-red-900/30",
      border: "hover:border-red-300 dark:hover:border-red-600",
      text: "text-red-600 dark:text-red-400",
      iconBg:
        "bg-red-100 dark:bg-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-800",
    },
    emerald: {
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
      border: "hover:border-emerald-300 dark:hover:border-emerald-600",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    },
  };
  return colors[color] || colors.blue;
};
const Dashboard = () => {
  const navigate = useNavigate();

  // GET USER ROLE
  const user = useSelector((state) => state.auth.user);
  const role = user?.type?.toLowerCase();

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
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

  return (
    <div className="animate-fadeIn px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl bg-gradient-to-br ${dashboardConfig.gradient} shadow-md`}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardConfig.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {dashboardConfig.description}
              </p>
            </div>
          </div>

          
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {dashboardConfig.sections.map((section, sIdx) => {
          const SectionIcon = section.icon;

          // FILTER ITEMS BASED ON ROLE
          const filteredItems = section.items.filter((item) => {
            if (role === "employee" && item.name === "Ticket") {
              return false;
            }
            return true;
          });

          return (
            <div key={sIdx} className="animate-slideUp">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div
                  className={`p-1.5 rounded-lg bg-gradient-to-br ${section.gradient}`}
                >
                  <SectionIcon className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <span className="text-xs text-gray-500">
                  {section.description}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const colors = getColorStyles(item.color);

                  let colSpanClass = "col-span-1";
                  if (
                    [
                      "Ticket",
                      "Tickets",
                      "Active Tickets",
                      "Critical Tickets",
                    ].includes(item.name)
                  ) {
                    colSpanClass = "col-span-2";
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className={`group cursor-pointer ${colSpanClass}`}
                    >
                      <div
                        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
                      >
                        <div className="p-3 flex flex-col items-center text-center">
                          <div
                            className={`p-2 rounded-lg ${colors.iconBg} mb-2`}
                          >
                            <Icon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <h3 className="text-xs sm:text-sm text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="space-y-6 mt-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Employee Ticket Stats
          </h2>
          <span className="text-xs text-gray-500">
            Overview of ticket assignments per employee
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
          <div className="flex-1 min-w-[300px] bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-md hover:shadow-lg backdrop-blur-sm">
            <EmployeeBarChart theme={isDarkMode ? "dark" : "light"} />
          </div>
          <div className="flex-1 min-w-[300px] bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-md hover:shadow-lg backdrop-blur-sm">
            <EmployeeDoughnutChart theme={isDarkMode ? "dark" : "light"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
