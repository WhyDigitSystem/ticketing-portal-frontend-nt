import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Trophy } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ticketAPI } from "../../api/ticketAPI";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmployeeBarChart = ({ theme }) => {
  const [employeeNames, setEmployeeNames] = useState([]);
  const [completedCounts, setCompletedCounts] = useState([]);
  const [inProgressCounts, setInProgressCounts] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [topPerformer, setTopPerformer] = useState(null);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        const employeeStats =
          await ticketAPI.getEmployeeTicketStatusCounts();

        const validEmployees = employeeStats
          .filter((emp) => emp.empName?.trim())
          .sort(
            (a, b) =>
              (b.inprogress + b.completed) -
              (a.inprogress + a.completed)
          );

        const names = validEmployees.map((emp) => emp.empName);
        const completed = validEmployees.map(
          (emp) => emp.completed || 0
        );
        const inProgress = validEmployees.map(
          (emp) => emp.inprogress || 0
        );

        const rates = validEmployees.map((emp) => {
          const total =
            (emp.completed || 0) + (emp.inprogress || 0);
          return total ? (emp.completed / total) * 100 : 0;
        });

        const top = validEmployees.reduce(
          (best, emp) => {
            const total =
              (emp.completed || 0) + (emp.inprogress || 0);

            return total > best.total
              ? { name: emp.empName, total }
              : best;
          },
          { name: "", total: 0 }
        );

        setEmployeeNames(names);
        setCompletedCounts(completed);
        setInProgressCounts(inProgress);
        setCompletionRates(rates);
        setTopPerformer(top);
      } catch (error) {
        console.error("Error loading employee chart data:", error);
      }
    };

    fetchEmployeeStats();
  }, []);

  // Theme-based styling
  const isDark = theme === "dark";

  const textColor = isDark ? "#e5e7eb" : "#1f2937";
  const gridColor = isDark
    ? "rgba(255,255,255,0.15)"
    : "rgba(0,0,0,0.08)";
  const tooltipBg = isDark ? "#374151" : "#f9fafb";

  const completedColor = "rgba(29, 78, 216, 0.9)";
  const inProgressColor = "rgba(96, 165, 250, 0.8)";

  const data = {
    labels: employeeNames,
    datasets: [
      {
        label: "Completed",
        data: completedCounts,
        backgroundColor: completedColor,
        borderRadius: 6,
        barThickness: 18,
      },
      {
        label: "In Progress",
        data: inProgressCounts,
        backgroundColor: inProgressColor,
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 14,
        },
      },

      tooltip: {
  backgroundColor: tooltipBg,
  titleColor: textColor,
  bodyColor: textColor,

  callbacks: {
    title: (items) => `Employee: ${items[0].label}`,

    label: (context) => {
      const value = context.raw;
      return `${context.dataset.label}: ${value}`;
    },

    afterBody: (items) => {
      const i = items[0].dataIndex;

      const completed = completedCounts[i];
      const inProgress = inProgressCounts[i];
      const rate = completionRates[i]?.toFixed(1);

      return [
        `Completion Rate: ${rate}%`,
      ];
    },
  },
}
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 25,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          stepSize: 1,
        },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Top Performer */}
      {topPerformer && (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 8,

        background: isDark
          ? "linear-gradient(135deg, rgba(55,65,81,0.85), rgba(31,41,55,0.85))"
          : "#ffffff",

        border: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(15,23,42,0.08)",

        boxShadow: isDark
          ? "0 3px 10px rgba(0,0,0,0.25)"
          : "0 2px 6px rgba(15,23,42,0.06)",

        backdropFilter: "blur(5px)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          color: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          flexShrink: 0,
        }}
      >
        <Trophy size={16} />
      </div>

      <div style={{ lineHeight: 1.1 }}>
        <div
          style={{
            fontSize: 10,
            opacity: 0.65,
            letterSpacing: "0.4px",
          }}
        >
          TOP PERFORMER
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: textColor,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{topPerformer.name}</span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              opacity: 0.75,
            }}
          >
            ({topPerformer.total})
          </span>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Chart */}
      <div
        style={{
          height: 270,
          width: "100%",
          paddingTop: 8,
        }}
      >
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default EmployeeBarChart;