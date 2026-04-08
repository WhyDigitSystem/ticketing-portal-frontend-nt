import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Eye,
  ChevronUp,
  ChevronDown,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../../api/customerAPI";

const AllCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [hoveredRow, setHoveredRow] = useState({});
  const [deleting, setDeleting] = useState({});

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
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedCustomers = useMemo(() => {
    if (!sortConfig.key) return customers;
    const sorted = [...customers].sort((a, b) => {
      const aValue = sortConfig.key === "createdon" ? a.commonDate?.createdon : a[sortConfig.key];
      const bValue = sortConfig.key === "createdon" ? b.commonDate?.createdon : b[sortConfig.key];

      const aDate = Date.parse(aValue);
      const bDate = Date.parse(bValue);

      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
      if (typeof aValue === "string") return aValue.localeCompare(bValue);
      return (aValue || 0) - (bValue || 0);
    });
    if (sortConfig.direction === "desc") sorted.reverse();
    return sorted;
  }, [customers, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  if (loading) return <p className="text-center mt-10">Loading customers...</p>;

  return (
    <div className="animate-fadeIn px-6 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/menu/customer")}
        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Back to Customer Management</span>
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Customers</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage all customers
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Total</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              {[
                { key: "userId", label: "ID", width: "w-[80px]" },
                { key: "firstName", label: "Name", width: "w-[180px]" },
                { key: "email", label: "Email", width: "w-[180px]" },
                { key: "company", label: "Company", width: "w-[140px]" },
                { key: "type", label: "Type", width: "w-[100px]" },
                { key: "loginStatus", label: "Login", width: "w-[80px]" },
                { key: "active", label: "Active", width: "w-[80px]" },
                { key: "createdon", label: "Created On", width: "w-[120px]" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2 text-xs cursor-pointer select-none ${col.width}`}
                >
                  <div className="flex items-center gap-1">{col.label}{renderSortIcon(col.key)}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCustomers.map((customer, index) => (
              <tr
                key={customer.userId}
                onMouseEnter={() => setHoveredRow(customer.userId)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition animate-slideUp ${
                  hoveredRow === customer.userId ? "border-l-4 border-blue-500 dark:border-blue-400" : ""
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Actions */}
               

                <td className="px-3 py-2 whitespace-nowrap">{customer.userId}</td>
                <td className="px-3 py-2 max-w-[180px] truncate">{customer.firstName}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.company}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.type}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.loginStatus ? "Online" : "Offline"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.active ? "Active" : "Inactive"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.commonDate?.createdon || "-"}</td>
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
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
.animate-slideUp { animation: slideUp 0.3s ease-out forwards; opacity: 0; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AllCustomer;