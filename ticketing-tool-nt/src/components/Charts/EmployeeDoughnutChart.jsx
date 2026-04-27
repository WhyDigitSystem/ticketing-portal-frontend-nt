import React, { useEffect, useState, useMemo } from "react";
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

        setPriorityData({
          normal: data?.normal ?? 0,
          medium: data?.medium ?? 0,
          high: data?.high ?? 0,
        });
      } catch (error) {
        console.error("Error loading doughnut data:", error);
      }
    };

    fetchData();
  }, []);

  const bgColors = useMemo(
  () =>
    theme === "dark"
      ? ["#3b82f6","#7dd3fc","#a78bfa"]
      : ["#93c5fd", "#bae6fd", "#c4b5fd"],
  [theme]
);

  const borderColor =
    theme === "dark"
      ? ["#111827", "#111827", "#111827"]
      : ["#fff", "#fff", "#fff"];

  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";
  const tooltipBg = theme === "dark" ? "#374151" : "#f9fafb";

  const total =
    priorityData.normal + priorityData.medium + priorityData.high;

  const data = {
    labels: ["Normal", "Medium", "High"],
    datasets: [
      {
        label: "Tickets by Priority",
        data: [priorityData.normal, priorityData.medium, priorityData.high],
        backgroundColor: bgColors,
        borderColor,
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
        labels: {
          color: textColor,
          padding: 15,
          boxWidth: 12,
        },
      },

      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: textColor,
        bodyColor: textColor,
      },
    },
  };

  return (
    <div className="relative h-[300px] w-full">
      <Doughnut data={data} options={options} />

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          style={{
            fontSize: "26px",
            fontWeight: "700",
            color: textColor,
            lineHeight: "1",
          }}
        >
          {total}
        </div>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.7,
            marginTop: "4px",
            color: textColor,
          }}
        >
          Total Tickets
        </div>
      </div>  
    </div>
  );  


  
};

export default EmployeeDoughnutChart;