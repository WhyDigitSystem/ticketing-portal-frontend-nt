import React from "react";

const TicketFilters = ({
  filters,
  setFilters,
  employees,
  tickets,
}) => {
  // Unique values
  const applications = [
    ...new Set(tickets.map((t) => t.projectName).filter(Boolean)),
  ];

  const statuses = [
    ...new Set(tickets.map((t) => t.status).filter(Boolean)),
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">

      {/* Application Filter */}
      <select
        value={filters.application}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            application: e.target.value,
          }))
        }
        className="px-3 py-1.5 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="">All Applications</option>
        {applications.map((app, i) => (
          <option key={i} value={app}>
            {app}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            status: e.target.value,
          }))
        }
        className="px-3 py-1.5 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="">All Status</option>
        {statuses.map((status, i) => (
          <option key={i} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Assigned To Filter */}
      <select
        value={filters.assignedTo}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            assignedTo: e.target.value,
          }))
        }
        className="px-3 py-1.5 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="">All Employees</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.email}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      <button
        onClick={() =>
          setFilters({
            application: "",
            status: "",
            assignedTo: "",
          })
        }
        className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-80"
      >
        Clear
      </button>
    </div>
  );
};

export default TicketFilters;