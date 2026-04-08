import React, { useEffect, useState, useMemo } from "react";
import {
  Eye,
  ArrowLeft,
  Users,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { employeeAPI } from "../../api/employeeAPI";
import { useNavigate } from "react-router-dom";

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [hoveredRow, setHoveredRow] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const empList = await employeeAPI.getAllEmployees();
        setEmployees(empList);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = useMemo(() => {
    if (!sortConfig.key) return employees;
    const sorted = [...employees].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      const aDate = Date.parse(aValue);
      const bDate = Date.parse(bValue);

      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
      if (typeof aValue === "string") return aValue.localeCompare(bValue);

      return (aValue || 0) - (bValue || 0);
    });

    if (sortConfig.direction === "desc") sorted.reverse();
    return sorted;
  }, [employees, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  

  if (loading) {
    return <p className="text-center mt-10">Loading employees...</p>;
  }

  return (
    <div className="animate-fadeIn px-6 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/menu/employee")}
        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">
          Back to Employee Management
        </span>
      </button>

      {/* Header */}
      <div className="relative mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                All Employees
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage all employees
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Total</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {employees.length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              

              {[
                { key: "id", label: "ID", width: "w-[80px]" },
                { key: "name", label: "Name", width: "w-[200px]" },
                { key: "code", label: "Code", width: "w-[100px]" },
                { key: "department", label: "Department", width: "w-[140px]" },
                { key: "designation", label: "Designation", width: "w-[140px]" },
                { key: "branch", label: "Branch", width: "w-[120px]" },
                { key: "email", label: "Email", width: "w-[180px]" },
                { key: "doj", label: "Joining Date", width: "w-[120px]" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2 text-xs cursor-pointer select-none ${col.width}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedEmployees.map((emp, index) => (
              <tr
                key={emp.id}
                onMouseEnter={() => setHoveredRow(emp.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition animate-slideUp ${
                  hoveredRow === emp.id
                    ? "border-l-4 border-blue-500 dark:border-blue-400"
                    : ""
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                

                <td className="px-3 py-2 whitespace-nowrap">{emp.id}</td>
                <td className="px-3 py-2 max-w-[180px] truncate">{emp.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{emp.code}</td>
                <td className="px-3 py-2 whitespace-nowrap">{emp.department}</td>
                <td className="px-3 py-2 whitespace-nowrap">{emp.designation}</td>
                <td className="px-3 py-2 whitespace-nowrap">{emp.branch}</td>
                <td className="px-3 py-2 whitespace-nowrap">{emp.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {emp.doj ? new Date(emp.doj).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* Animations */
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
.animate-slideUp { animation: slideUp 0.3s ease-out forwards; opacity: 0; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AllEmployees;  