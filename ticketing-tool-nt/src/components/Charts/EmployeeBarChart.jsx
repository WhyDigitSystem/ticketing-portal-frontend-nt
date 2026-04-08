import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
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
  const [employees, setEmployees] = useState([]);
  const [completedTickets, setCompletedTickets] = useState([]);
  const [inProgressTickets, setInProgressTickets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ticketAPI.getEmployeeTicketStatusCounts();

        const filtered = res.filter(
          (emp) => emp.empName && emp.empName.trim() !== ""
        );

        // 🔥 Sort by total tickets (better alignment visually)
        filtered.sort(
          (a, b) =>
            b.inprogress + b.completed - (a.inprogress + a.completed)
        );

        setEmployees(filtered.map((emp) => emp.empName));
        setCompletedTickets(filtered.map((emp) => emp.completed || 0));
        setInProgressTickets(filtered.map((emp) => emp.inprogress || 0));
      } catch (error) {
        console.error("Error loading chart data:", error);
      }
    };

    fetchData();
  }, []);

  const completedColor =
    theme === "dark" ? "rgba(52,211,153,0.8)" : "rgba(54,162,235,0.7)";
  const inProgressColor =
    theme === "dark" ? "rgba(59,130,246,0.8)" : "rgba(153,102,255,0.7)";

  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";
  const gridColor =
    theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
  const tooltipBg = theme === "dark" ? "#374151" : "#f9fafb";

  const data = {
    labels: employees,
    datasets: [
      {
        label: "Completed",
        data: completedTickets,
        backgroundColor: completedColor,
        borderRadius: 6,
        barThickness: 20, 
      },
      {
        label: "In Progress",
        data: inProgressTickets,
        backgroundColor: inProgressColor,
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "end", 
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: "Employee Ticket Overview",
        align: "start", 
        color: textColor,
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: tooltipBg,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 30, 
          minRotation: 0,
        },
        grid: {
          display: false, 
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          stepSize: 1, 
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return (
    <div style={{ height: "350px", width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default EmployeeBarChart;