import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, TrendingUp, ChevronRight } from "lucide-react";
import menuConfig from "../menu-items/index";

const MenuPage = () => {
  const navigate = useNavigate();
  const { menuName } = useParams();

  const user = useSelector((state) => state.auth.user);
  const role = user?.type?.toLowerCase();

  const config = menuConfig[menuName];

  if (!config) {
    navigate("/transporter");
    return null;
  }

  const Icon = config.icon;

  const filteredItems = config.items?.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(role);
  });

  
  const getIconColor = (name = "") => {
  const n = name.toLowerCase();

  // CREATE / ADD
  if (
    n.includes("create") ||
    n.includes("add") ||
    n.includes("new")
  )
    return "from-green-500 to-emerald-600";

  // UPDATE / EDIT
  if (
    n.includes("update") ||
    n.includes("edit") ||
    n.includes("modify")
  )
    return "from-yellow-500 to-orange-500";

  // DELETE / CRITICAL
  if (
    n.includes("delete") ||
    n.includes("critical") ||
    n.includes("error")
  )
    return "from-red-500 to-rose-600";

  // ANALYTICS / REPORT
  if (
    n.includes("analytics") ||
    n.includes("report")
  )
    return "from-purple-500 to-indigo-600";

  // VIEW / LIST
  if (
    n.includes("view") ||
    n.includes("list") ||
    n.includes("all")
  )
    return "from-blue-500 to-cyan-600";

  return "from-gray-500 to-gray-700";
};

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 animate-fadeIn">
      <div className="max-w-6xl mx-auto">

            {/* Back Button */}
                  <button
                    onClick={() => navigate("/")}
                    className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Back to Dashboard</span>
                  </button>

        {/* ================= HEADER ================= */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">

          {/* blobs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-cyan-500/10 to-teal-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col gap-3">

            {/* TITLE ROW */}
            <div className="flex items-center justify-between flex-wrap gap-3">

              {/* LEFT TITLE */}
              <div className="flex items-center gap-3">

                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {config.title}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>

              </div>

              {/* STATS */}
              {config.stats && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase">
                      {config.stats.period}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {config.stats.total}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs">{config.stats.change}</span>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>

        {/* ================= CARDS ================= */}
        <div className="flex flex-wrap gap-3 justify-start animate-slideUp">

          {filteredItems?.map((item, index) => {
            const ItemIcon = item.icon;
            const gradient = getIconColor(item.name);

            return (
              <div
                key={item.name}
                onClick={() => navigate(item.path)}
                className="group cursor-pointer w-[220px]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="
                  bg-white dark:bg-gray-800
                  rounded-lg border border-gray-200 dark:border-gray-700
                  shadow-sm hover:shadow-md hover:scale-[1.02]
                  transition-all duration-300
                ">

                  <div className="p-3 flex flex-col gap-2">

                    {/* ICON (semantic color) */}
                    <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>

                    {/* TEXT */}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>

                    {/* CHEVRON */}
                    <div className="flex justify-end text-blue-600 dark:text-blue-400">
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

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

export default MenuPage;