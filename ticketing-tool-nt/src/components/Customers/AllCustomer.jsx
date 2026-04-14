import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../../api/customerAPI";

const AllCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Default sort by createdon DESC
  const [sortConfig, setSortConfig] = useState({
    key: "createdon",
    direction: "desc",
  });

  const [hoveredRow, setHoveredRow] = useState(null);

  //  Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const navigate = useNavigate();

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const customerList = await customerAPI.getAllCustomers();
        setCustomers(customerList);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = useMemo(() => {
    const sorted = [...customers].sort((a, b) => {
      const aValue =
        sortConfig.key === "createdon"
          ? a.commonDate?.createdon
          : a[sortConfig.key];

      const bValue =
        sortConfig.key === "createdon"
          ? b.commonDate?.createdon
          : b[sortConfig.key];

      const aDate = Date.parse(aValue);
      const bDate = Date.parse(bValue);

      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
      if (typeof aValue === "string")
        return (aValue || "").localeCompare(bValue || "");

      return (aValue || 0) - (bValue || 0);
    });

    if (sortConfig.direction === "desc") sorted.reverse();
    return sorted;
  }, [customers, sortConfig]);

  //  Pagination slice
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedCustomers.slice(start, start + recordsPerPage);
  }, [sortedCustomers, currentPage]);

  const totalPages = Math.ceil(sortedCustomers.length / recordsPerPage);

  // Reset page when sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  if (loading)
    return <p className="text-center mt-10 animate-fadeIn">Loading customers...</p>;

  return (
    <div className="animate-fadeIn px-6 py-6">

      {/* Back */}
      <button
        onClick={() => navigate("/menu/customer")}
        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 animate-slideUp"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">
          Back to Customer Management
        </span>
      </button>

      {/* Header */}
      <div className="relative mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 animate-slideUp">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <List className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                All Customers
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage all customers
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border">
            <p className="text-[10px] text-gray-500">TOTAL</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {customers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border overflow-x-auto animate-slideUp">
        <table className="min-w-full">
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
                  className="px-3 py-2 text-xs  cursor-pointer"
                >
                  <div className="flex justify-start items-center gap-1">
                    {col.label}
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedCustomers.map((customer, index) => (
              <tr
                key={customer.userId}
                onMouseEnter={() => setHoveredRow(customer.userId)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  hoveredRow === customer.userId
                    ? "border-l-4 border-blue-500"
                    : ""
                } animate-slideUp`}
              >
                <td className="px-3 py-2 text-left">{customer.userId}</td>
                <td className="px-3 py-2 text-left">
                  {customer.firstName}
                </td>
                <td className="px-3 py-2 text-left">
                  {customer.email}
                </td>
                <td className="px-3 py-2 text-left">
                  {customer.company}
                </td>
                <td className="px-3 py-2 text-left">
                  {customer.loginStatus ? "Online" : "Offline"}
                </td>
                <td className="px-3 py-2 text-left">
                  {customer.active ? "Active" : "Inactive"}
                </td>
                <td className="px-3 py-2 text-left">
                  {customer.commonDate?.createdon
                    ? new Date(
                        customer.commonDate.createdon
                      ).toLocaleDateString()
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