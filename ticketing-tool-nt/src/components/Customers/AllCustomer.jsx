import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  List,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { customerAPI } from "../../api/customerAPI";
import { useNavigate } from "react-router-dom";

const AllCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({
    key: "createdon",
    direction: "desc",
  });

  const [hoveredRow, setHoveredRow] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await customerAPI.getAllCustomers();
        setCustomers(res);
      } catch (error) {
        console.error(error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  /** Sorting */
  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const sortedCustomers = useMemo(() => {
    if (!sortConfig.key) return customers;

    const sorted = [...customers].sort((a, b) => {
      const aValue =
        sortConfig.key === "createdon"
          ? a?.commonDate?.createdon
          : a?.[sortConfig.key];

      const bValue =
        sortConfig.key === "createdon"
          ? b?.commonDate?.createdon
          : b?.[sortConfig.key];

      const aDate = Date.parse(aValue);
      const bDate = Date.parse(bValue);

      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;

      if (typeof aValue === "string")
        return (aValue || "").localeCompare(bValue || "");

      return (aValue || 0) - (bValue || 0);
    });

    return sortConfig.direction === "desc" ? sorted.reverse() : sorted;
  }, [customers, sortConfig]);

  /** Reset page on sort */
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  /** Pagination */
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedCustomers.slice(start, start + recordsPerPage);
  }, [sortedCustomers, currentPage]);

  const totalPages = Math.ceil(sortedCustomers.length / recordsPerPage);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;

    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  if (loading) {
    return (
      <p className="text-center mt-10 animate-fadeIn">
        Loading customers...
      </p>
    );
  }

  return (
    <div className="animate-fadeIn px-6 py-6">

      {/* Back */}
      <button
        onClick={() => navigate("/menu/customer")}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-3"
      >
        <ArrowLeft size={14} />
        <span className="text-xs">Back to Customer Management</span>
      </button>

      {/* Header */}
      <div className="relative mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 animate-slideUp">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <List className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold dark:text-white">
                All Customers
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage all customers
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border">
            <p className="text-[10px] text-gray-500 uppercase">Total</p>
            <p className="text-sm font-bold dark:text-white">
              {customers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="inline-block bg-white dark:bg-gray-800 rounded-xl shadow border overflow-x-auto animate-slideUp">
  <table className="w-max table-auto whitespace-nowrap divide-y dark:divide-gray-700">

          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {[
                { key: "userId", label: "ID" },
                { key: "firstName", label: "Name" },
                { key: "email", label: "Email" },
                { key: "company", label: "Company" },
                { key: "loginStatus", label: "Login" },
                { key: "active", label: "Active" },
                { key: "createdon", label: "Created On" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y dark:divide-gray-700">
            {paginatedCustomers.map((customer) => (
              <tr
                key={customer.userId}
                onMouseEnter={() => setHoveredRow(customer.userId)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  hoveredRow === customer.userId
                    ? "border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <td className="px-3 py-2">{customer.userId}</td>
                <td className="px-3 py-2">{customer.firstName}</td>
                <td className="px-3 py-2">{customer.email}</td>
                <td className="px-3 py-2">{customer.company}</td>
                <td className="px-3 py-2">
                  {customer.loginStatus ? "Online" : "Offline"}
                </td>
                <td className="px-3 py-2">
                  {customer.active ? "Active" : "Inactive"}
                </td>
                <td className="px-3 py-2">
                  {customer?.commonDate?.createdon
                    ? new Date(customer.commonDate.createdon).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
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

export default AllCustomer;