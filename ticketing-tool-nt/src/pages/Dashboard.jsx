import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Tag,
  Tags,
  FileExclamationPoint,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import EmployeeBarChart from "../components/Charts/EmployeeBarChart";
import EmployeeDoughnutChart from "../components/Charts/EmployeeDoughnutChart";

const dashboardConfig = {
  sections: [
    {
      title: "Ticket Actions",
      description: "Create and manage tickets",
      icon: FolderOpen,
      gradient: "from-blue-500 to-cyan-500",
      items: [
        {
          name: "Ticket",
          path: "/newticket",
          icon: Tag,
          color: "orange",
          description: "Create ticket",
        },
        {
          name: "Tickets",
          path: "/alltickets",
          icon: Tags,
          color: "orange",
          description: "All tickets",
        },
      ],
    },
    {
      title: "Monitoring",
      description: "Track ticket status",
      icon: FolderOpen,
      gradient: "from-emerald-500 to-teal-500",
      items: [
        {
          name: "Critical",
          path: "/criticaltickets",
          icon: FileExclamationPoint,
          color: "red",
          description: "High priority",
        },
      ],
    },
  ],
};

const getColorStyles = (color) => {
  const colors = {
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
  };
  return colors[color] || colors.orange;
};

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

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto bg-gray-50 dark:bg-gray-900">

      {/* ================= TOP SECTION ================= */}
      <div className="grid grid-cols-1  lg:grid-cols-3  gap-3 p-2 sm:p-4 flex-none">

        {dashboardConfig.sections.map((section, sIdx) => {
          const SectionIcon = section.icon;

          const filteredItems = section.items.filter((item) => {
            if (role === "employee" && item.name === "Ticket") return false;
            return true;
          });

          return (
            <div
              key={sIdx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${section.gradient}`}
                >
                  <SectionIcon className="h-4 w-4 text-white" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const colors = getColorStyles(item.color);

                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className={`cursor-pointer rounded-lg border ${colors.border} ${colors.hover} transition-all hover:scale-[1.02]`}
                    >
                      <div className="p-2 text-center">
                        <div
                          className={`mx-auto w-fit p-1.5 rounded-md ${colors.iconBg}`}
                        >
                          <Icon className={`h-4 w-4 ${colors.text}`} />
                        </div>

                        <div className="text-xs font-medium mt-1 text-gray-900 dark:text-white">
                          {item.name}
                        </div>

                        <div className="text-[10px] text-gray-500">
                          {item.description}
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

      {/* ================= CHART SECTION ================= */}
      <div className="flex-1 min-h-0 p-2 sm:p-4 pt-0">

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Employee Ticket Stats
            </h2>
            <p className="text-[11px] text-gray-500">
              Overview of ticket distribution
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 min-h-[300px]">

          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 min-h-[250px]">
            <EmployeeBarChart theme={isDarkMode ? "dark" : "light"} />
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 flex items-center justify-center min-h-[250px]">
            <EmployeeDoughnutChart theme={isDarkMode ? "dark" : "light"} />
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;