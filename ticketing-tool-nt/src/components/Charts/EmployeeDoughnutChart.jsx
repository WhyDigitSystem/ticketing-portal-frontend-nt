
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { AlertTriangle } from "lucide-react";
import { ticketAPI } from "../../api/ticketAPI";

ChartJS.register(ArcElement, Tooltip, Legend);

const TicketPriorityChart = () => {
  const [priorityData, setPriorityData] = useState({
    high: 0,
    medium: 0,
    normal: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ticketAPI.getTicketPriorityStatusCount();

        setPriorityData({
          high: data?.high || 0,
          medium: data?.medium || 0,
          normal: data?.normal || 0,
        });
      } catch (e) {
        console.log(e);
      }
    };

    loadData();
  }, []);

  const total =
    priorityData.high + priorityData.medium + priorityData.normal;

  const percentages = {
    high: ((priorityData.high / total) * 100 || 0).toFixed(0),
    medium: ((priorityData.medium / total) * 100 || 0).toFixed(0),
    normal: ((priorityData.normal / total) * 100 || 0).toFixed(0),
  };

  const data = {
    labels: ["High", "Medium", "Normal"],
    datasets: [
      {
        data: [priorityData.high, priorityData.medium, priorityData.normal],
        backgroundColor: ["#ef4444", "#2563eb", "#10b981"],
        borderWidth: 0,
        cutout: "72%",
        spacing: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      },
    },
  };

  return (
    <div>

      {/* MAIN CONTENT */}
      <div className="flex items-center gap-20">
        {/* CHART */}
        <div className="relative w-[220px] h-[180px]">
          <Doughnut data={data} options={options} />

          {/* CENTER VALUE */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
              {total}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total Tickets
            </p>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex-1 space-y-2">

          {/* HIGH */}
          <div className="flex items-center justify-between min-h-[40px]">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />

              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                High Priority - {percentages.high}%
              </span>
            </div>

          </div>

          {/* MEDIUM */}
          <div className="flex items-center justify-between min-h-[40px]">

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />

              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                Medium Priority - {percentages.high}%
              </span>
            </div>

          </div>

          {/* NORMAL */}
          <div className="flex items-center justify-between min-h-[40px]">

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />

              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                Normal Priority - {percentages.high}%
              </span>
            </div>



          </div>

        </div>
      </div>

      {/* ALERT */}
      <div className="mt-5 flex justify-center">
        
          <AlertTriangle size={15} className="text-red-500" />

          <p className=" pl-2 text-xs text-red-500 font-medium">
             High priority tickets need immediate attention
          </p>
        
      </div>
    </div>
  );
};

export default TicketPriorityChart;