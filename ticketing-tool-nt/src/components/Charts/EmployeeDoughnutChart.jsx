import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { ticketAPI } from "../../api/ticketAPI";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const EmployeeDoughnutChart = ({ theme }) => {
  const [priorityData, setPriorityData] = useState({
    normal: 0,
    medium: 0,
    high: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ticketAPI.getTicketPriorityStatusCount();
        setPriorityData(data);
      } catch (error) {
        console.error("Error loading doughnut data:", error);
      }
    };

    fetchData();
  }, []);

  // Colors mapped to priority
  const bgColors =
    theme === "dark"
      ? [
          "rgba(52,211,153,0.8)", // Normal
          "rgba(59,130,246,0.8)", // Medium
          "rgba(239,68,68,0.8)",  // High
        ]
      : [
          "rgba(54,162,235,0.7)",
          "rgba(153,102,255,0.7)",
          "rgba(255,99,132,0.7)",
        ];

  const borderColor =
    theme === "dark"
      ? ["#111827", "#111827", "#111827"]
      : ["#fff", "#fff", "#fff"];

  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";
  const tooltipBg = theme === "dark" ? "#374151" : "#f9fafb";

  const data = {
    labels: ["Normal", "Medium", "High"],
    datasets: [
      {
        label: "Tickets by Priority",
        data: [
          priorityData.normal,
          priorityData.medium,
          priorityData.high,
        ],
        backgroundColor: bgColors,
        borderColor: borderColor,
        borderWidth: 2,
        hoverOffset: 12,
        cutout: "65%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          color: textColor,
          padding: 15,
          boxWidth: 12,
        },
      },
      title: {
        display: true,
        text: "Ticket Priority Distribution",
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
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default EmployeeDoughnutChart;