import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Eye, ChevronUp, ChevronDown, Check, FileExclamationPoint } from "lucide-react";
import { ticketAPI } from "../../api/ticketAPI";
import { employeeAPI } from "../../api/employeeAPI";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TicketPopup from "./TicketPopup";
import TicketFilters from "./TicketFilters";

const CriticalTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({
    key: "docDate",
    direction: "desc",
  });

  const [employees, setEmployees] = useState([]);
  const [assigning, setAssigning] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [filters, setFilters] = useState({
    application: "",
    status: "",
    assignedTo: "",
  });

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
        console.error(err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  /** Fetch Tickets */
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const allTickets = await ticketAPI.getAllTickets();

        const normalized = allTickets.map((t) => ({
          ...t,
          assignedToEmp: t.email || t.assignedToEmp || "",
          companyName: t.companyName || t.company || "",
        }));

        let criticalTickets = normalized.filter(
          (t) => (t.priority || "").toLowerCase() === "critical"
        );

        const visibleTickets =
          role === "admin"
            ? criticalTickets
            : role === "employee"
              ? criticalTickets.filter(
                (t) =>
                  t.assignedToEmp === user.email ||
                  t.assignedToEmp === user.name
              )
              : role === "customer"
                ? criticalTickets.filter(
                  (t) =>
                    t.createdBy === user.email ||
                    t.createdBy === user.name
                )
                : [];

        setTickets(visibleTickets);
      } catch (err) {
        console.error(err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTickets();
  }, [role, user]);

  /** Sorting */
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      return (
        (!filters.application || t.projectName === filters.application) &&
        (!filters.status || t.status === filters.status) &&
        (!filters.assignedTo || t.assignedToEmp === filters.assignedTo)
      );
    });
  }, [tickets, filters]);

  const sortedTickets = useMemo(() => {
    if (!sortConfig.key) return filteredTickets;

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
  }, [filteredTickets, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedTickets.slice(start, start + recordsPerPage);
  }, [sortedTickets, currentPage]);

  const totalPages = Math.ceil(sortedTickets.length / recordsPerPage);

  const renderSortIcon = (key) =>
    sortConfig.key !== key ? null : sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );

  /** Assign */
  const handleAssignChange = async (ticketId, employeeEmail) => {
    try {
      setAssigning((prev) => ({ ...prev, [ticketId]: true }));

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, assignedToEmp: employeeEmail }
            : t
        )
      );

      const response = await ticketAPI.assignTicket({
        id: ticketId,
        assignedToEmployee: employeeEmail,
        email: employeeEmail,
        modifiedBy: user.name || user.email,
      });

      if (response.success) {
        const empName =
          employees.find((e) => e.email === employeeEmail)?.name ||
          employeeEmail;
        setSuccessMessage(`Ticket ${ticketId} assigned to ${empName}`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        revertAssign(ticketId);
      }
    } catch (err) {
      console.error(err);
      revertAssign(ticketId);
    } finally {
      setAssigning((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const revertAssign = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, assignedToEmp: "" } : t
      )
    );
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    const oldTickets = [...tickets];

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus } : t
      )
    );

    try {
      const res = await ticketAPI.changeTicketStatus({
        id: ticketId,
        status: newStatus,
        empCode: user.email,
      });

      if (res.success) {
        setSuccessMessage("Status updated successfully");
        setTimeout(() => setSuccessMessage(""), 2500);
      } else {
        setTickets(oldTickets);
      }
    } catch (err) {
      console.error(err);
      setTickets(oldTickets);
    }
  };

  const getPriorityStyle = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "low":
      case "normal":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading)
    return <p className="text-center mt-10 animate-fadeIn">Loading tickets...</p>;

  return (
    <div className="animate-fadeIn px-6 py-6">

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow flex items-center gap-2 z-50 animate-fadeIn">
          <Check className="w-5 h-5 bg-white text-green-500 rounded-full p-1" />
          {successMessage}
        </div>
      )}

      <button
        onClick={() => navigate("/menu/ticket")}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-3 animate-slideUp"
      >
        <ArrowLeft size={14} />
        <span className="text-xs">Back to Ticket Management</span>
      </button>

      {/* Header */}
      <div className="relative mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 animate-slideUp">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
              <FileExclamationPoint className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold dark:text-white">
                Critical Tickets
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage all critical tickets
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">


            <TicketFilters
              filters={filters}
              setFilters={setFilters}
              employees={employees}
              tickets={tickets}
            />

            {/* TOTAL BOX */}
            <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <p className="text-[10px] text-gray-500 uppercase">Total</p>
              <p className="text-sm font-bold dark:text-white">
                {filteredTickets.length}
              </p>
            </div>

          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto animate-slideUp">
        <table className="min-w-full divide-y dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-xs text-center">Actions</th>

              {[
                { key: "id", label: "Ticket No" },
                { key: "title", label: "Title" },
                 
                { key: "projectName", label: "Application" },
                { key: "companyName", label: "Company" },
                { key: "User", label: "User" },
                { key: "priority", label: "Priority" },
                { key: "status", label: "Status" },
                { key: "assignedToEmp", label: "Assign To" },
                { key: "docDate", label: "Date" },
                { key: "completedOn", label: "Due Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-xs text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1 justify-start">
                    {col.label}
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y dark:divide-gray-700">
            {paginatedTickets.map((ticket) => {
              const assignedEmployee = employees.find(
                (e) => e.email === ticket.assignedToEmp
              );

              return (
                <tr
                  key={ticket.id}
                  onMouseEnter={() => setHoveredRow(ticket.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${hoveredRow === ticket.id
                    ? "border-l-4 border-red-500"
                    : ""
                    } animate-slideUp`}
                >
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsPopupOpen(true);
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full"
                    >
                      <Eye size={16} className="text-blue-500" />
                    </button>
                  </td>

                  <td className="px-3 py-2 text-left">{ticket.id}</td>
                  <td className="px-3 py-2 text-left">{ticket.title}</td>
                  
                  <td className="px-3 py-2 text-left">
                    {ticket.application || "-"}
                  </td>
                  <td className="px-3 py-2 text-left">
                    {ticket.customer || "-"}
                  </td>
                  <td className="px-3 py-2 text-left">{ticket.createdBy}</td>

                  <td className="px-3 py-2 text-left">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPriorityStyle(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-left">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket.id, e.target.value)
                      }
                      disabled={role === "customer"}
                      className="border rounded px-2 py-1 text-sm dark:bg-gray-700"
                    >
                      <option value="Inprogress">Inprogress</option>
                      <option value="Completed">Completed</option>
                      <option value="YetToAssign">YetToAssign</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="px-3 py-2 text-left">
                    {role === "admin" ? (
                      <select
                        value={ticket.assignedToEmp || ""}
                        onChange={(e) =>
                          handleAssignChange(ticket.id, e.target.value)
                        }
                        disabled={assigning[ticket.id]}
                        className="border rounded px-2 py-1 text-sm dark:bg-gray-700"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.email}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      assignedEmployee?.name || "Unassigned"
                    )}
                  </td>

                  <td className="px-3 py-2 text-left">
                    {ticket.docDate
                      ? new Date(ticket.docDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-2 text-left">
                    {ticket.completedOn
                      ? new Date(ticket.completedOn).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              );
            })}
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

      <TicketPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        ticket={selectedTicket}
      />
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

export default CriticalTickets;