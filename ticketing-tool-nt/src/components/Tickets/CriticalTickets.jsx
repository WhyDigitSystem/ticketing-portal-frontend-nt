import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Eye, ChevronUp, ChevronDown, Check } from "lucide-react";
import { ticketAPI } from "../../api/ticketAPI";
import { employeeAPI } from "../../api/employeeAPI";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TicketPopup from "./TicketPopup"; // import the popup component

const CriticalTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [employees, setEmployees] = useState([]);
  const [assigning, setAssigning] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // popup state

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const role = user?.type?.toLowerCase();

  /** Fetch Employees */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const empList = await employeeAPI.getAllEmployees();
        setEmployees(empList);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  /** Fetch Tickets and Filter Critical Tickets */
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const allTickets = await ticketAPI.getAllTickets();

        // Only critical tickets
        let criticalTickets = allTickets.filter(
          (t) => (t.priority || "").toLowerCase() === "critical"
        );

        // Map assignedToEmp to email
        criticalTickets = criticalTickets.map((t) => {
          if (!t.assignedToEmp) return t;
          const emp = employees.find(
            (e) => e.name === t.assignedToEmp || e.email === t.assignedToEmp
          );
          return { ...t, assignedToEmp: emp?.email || t.assignedToEmp };
        });

        // Employee sees only assigned tickets
        if (role === "employee") {
          criticalTickets = criticalTickets.filter(
            (t) => t.assignedToEmp === user.email
          );
        }

        setTickets(criticalTickets);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    if (user && employees.length) fetchTickets();
  }, [role, user, employees]);

  /** Sorting */
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedTickets = useMemo(() => {
    if (!sortConfig.key) return tickets;
    const sorted = [...tickets].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";

      const aDate = Date.parse(aVal);
      const bDate = Date.parse(bVal);

      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
      if (typeof aVal === "string") return aVal.localeCompare(bVal);
      return (aVal || 0) - (bVal || 0);
    });
    return sortConfig.direction === "desc" ? sorted.reverse() : sorted;
  }, [tickets, sortConfig]);

  const renderSortIcon = (key) =>
    sortConfig.key !== key ? null : sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;

  /** Assign Ticket */
  const handleAssignChange = async (ticketId, employeeEmail) => {
    try {
      setAssigning((prev) => ({ ...prev, [ticketId]: true }));

      // Optimistic UI update
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, assignedToEmp: employeeEmail } : t))
      );

      const response = await ticketAPI.assignTicket({
        id: ticketId,
        assignedToEmployee: employeeEmail,
        email: employeeEmail,
        modifiedBy: user.name || user.email,
      });

      if (response.success) {
        const empName = employees.find((e) => e.email === employeeEmail)?.name || employeeEmail;
        setSuccessMessage(`Ticket ${ticketId} assigned to ${empName}`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert("Failed to assign ticket");
        revertAssign(ticketId);
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning ticket");
      revertAssign(ticketId);
    } finally {
      setAssigning((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const revertAssign = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignedToEmp: "" } : t))
    );
  };

  /** Priority Styling */
  const getPriorityStyle = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "low":
      case "normal":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "critical":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <p className="text-center mt-10">Loading tickets...</p>;

  return (
    <div className="animate-fadeIn px-6 py-6">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-5 rounded shadow-md flex items-center gap-2 animate-fadeIn z-50">
          <Check className="w-6 h-6 bg-white text-green-500 rounded-full p-1" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <button
        onClick={() => navigate("/menu/ticket")}
        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Back to Ticket Management</span>
      </button>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-xs w-[120px]">Actions</th>
              {[
                { key: "id", label: "Ticket No" },
                { key: "title", label: "Title" },
                { key: "client", label: "Client" },
                { key: "status", label: "Status" },
                { key: "priority", label: "Priority" },
                { key: "assignedToEmp", label: "Assign To" },
                { key: "docDate", label: "Date" },
                { key: "completedOn", label: "Due Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-xs cursor-pointer select-none"
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
            {sortedTickets.map((ticket, index) => {
              const assignedEmployee = employees.find((e) => e.email === ticket.assignedToEmp);
              return (
                <tr
                  key={ticket.id}
                  onMouseEnter={() => setHoveredRow(ticket.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition animate-slideUp ${
                    hoveredRow === ticket.id ? "border-l-4 border-red-500 dark:border-red-400" : ""
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsPopupOpen(true); // open popup on click
                      }}
                      className="p-2 rounded-full bg-blue-50 hover:bg-blue-100"
                    >
                      <Eye size={16} className="text-blue-500" />
                    </button>
                  </td>

                  <td className="px-3 py-2">{ticket.id}</td>
                  <td className="px-3 py-2 truncate">{ticket.title}</td>
                  <td className="px-3 py-2">{ticket.client || "-"}</td>
                  <td className="px-3 py-2">{ticket.status}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {role === "admin" ? (
                      <select
                        value={ticket.assignedToEmp || ""}
                        onChange={(e) => handleAssignChange(ticket.id, e.target.value)}
                        disabled={assigning[ticket.id]}
                        className="border rounded px-2 py-1 text-sm dark:bg-gray-700 w-full"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.email}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {assignedEmployee?.name || "Unassigned"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{ticket.docDate ? new Date(ticket.docDate).toLocaleDateString() : "-"}</td>
                  <td className="px-3 py-2">{ticket.completedOn ? new Date(ticket.completedOn).toLocaleDateString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ticket Popup */}
      <TicketPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default CriticalTickets;