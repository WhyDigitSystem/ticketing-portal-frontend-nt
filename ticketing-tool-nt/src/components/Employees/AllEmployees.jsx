import React, { useEffect, useState, useMemo } from "react";
import {
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

  //  Default sort by DOJ
  const [sortConfig, setSortConfig] = useState({
    key: "doj",
    direction: "desc",
  });

  const [hoveredRow, setHoveredRow] = useState(null);

  //  Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const empList = await employeeAPI.getAllEmployees();
        setEmployees(empList);
      } catch (error) {
        console.error(error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  /** Sorting */
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

    return sortConfig.direction === "desc" ? sorted.reverse() : sorted;
  }, [employees, sortConfig]);

  //  Reset page on sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  //  Pagination slice
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedEmployees.slice(start, start + recordsPerPage);
  }, [sortedEmployees, currentPage]);

  const totalPages = Math.ceil(sortedEmployees.length / recordsPerPage);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  if (loading) {
    return <p className="text-center mt-10 animate-fadeIn">Loading employees...</p>;
  }

  return (
    <div className="animate-fadeIn px-6 py-6">

      {/* Back */}
      <button
        onClick={() => navigate("/menu/employee")}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-3"
      >
        <ArrowLeft size={14} />
        <span className="text-xs">Back</span>
      </button>

      {/* Header */}
      <div className="relative mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 animate-slideUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold dark:text-white">
                All Employees
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage all employees
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Total</p>
            <p className="text-sm font-bold dark:text-white">
              {employees.length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto animate-slideUp">
        <table className="min-w-full divide-y dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {[
                { key: "id", label: "ID" },
                { key: "name", label: "Name" },
                { key: "code", label: "Code" },
                { key: "department", label: "Department" },
                { key: "designation", label: "Designation" },
                { key: "branch", label: "Branch" },
                { key: "email", label: "Email" },
                { key: "doj", label: "Joining Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-xs cursor-pointer"
                >
                  <div className="flex justify-start items-center gap-1">
                    {col.label}
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y dark:divide-gray-700">
            {paginatedEmployees.map((emp) => (
              <tr
                key={emp.id}
                onMouseEnter={() => setHoveredRow(emp.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  hoveredRow === emp.id
                    ? "border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <td className="px-3 py-2 text-left">{emp.id}</td>
                <td className="px-3 py-2 text-left">{emp.name}</td>
                <td className="px-3 py-2 text-left">{emp.code}</td>
                <td className="px-3 py-2 text-left">{emp.department}</td>
                <td className="px-3 py-2 text-left">{emp.designation}</td>
                <td className="px-3 py-2 text-left">{emp.branch}</td>
                <td className="px-3 py-2 text-left">{emp.email}</td>
                <td className="px-3 py-2 text-left">
                  {emp.doj
                    ? new Date(emp.doj).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*  Pagination */}
      <div className="flex justify-between items-center mt-4 animate-slideUp">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Prev
          </button>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
.animate-slideUp { animation: slideUp 0.4s ease-out forwards; opacity: 0; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AllEmployees;