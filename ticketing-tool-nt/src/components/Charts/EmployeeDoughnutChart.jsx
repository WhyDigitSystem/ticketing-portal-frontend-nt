import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { ticketAPI } from "../../api/ticketAPI";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const EmployeeDoughnutChart = ({ theme }) => {
  const [priorityData, setPriorityData] = useState({
    normal: 0,
    medium: 0,
    high: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await ticketAPI.getTicketPriorityStatusCount();

        if (isMounted) {
          setPriorityData({
            normal: data?.normal ?? 0,
            medium: data?.medium ?? 0,
            high: data?.high ?? 0,
          });
        }
      } catch (error) {
        console.error("Error loading doughnut data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const bgColors = useMemo(
    () =>
      theme === "dark"
        ? ["#38bdf8", "#6366f1", "#3b82f6"]
        : ["#bae6fd", "#a5b4fc", "#93c5fd"],
    [theme]
  );

  const borderColor = useMemo(
    () => (theme === "dark" ? ["#111827", "#111827", "#111827"] : ["#fff", "#fff", "#fff"]),
    [theme]
  );

  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";
  const tooltipBg = theme === "dark" ? "#374151" : "#f9fafb";

  const total = useMemo(
    () => priorityData.normal + priorityData.medium + priorityData.high,
    [priorityData]
  );

  const data = useMemo(
    () => ({
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
          borderColor,
          borderWidth: 2,
          hoverOffset: 10,
          cutout: "65%",
        },
      ],
    }),
    [priorityData, bgColors, borderColor]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            padding: 12,
            boxWidth: 12,
          },
        },



        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: textColor,
          bodyColor: textColor,

          callbacks: {
            label: (context) => {
              const value = context.raw;
              const percentage = total
                ? ((value / total) * 100).toFixed(1)
                : 0;

              return `${value} (${percentage}%)`;
            },
          },
        },
      },
    }),
    [textColor, tooltipBg, total]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="relative h-[300px] w-full">
  <div className="h-full w-full">
    <Doughnut data={data} options={options} />
  </div>

  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
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
        fontSize: "11px",
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