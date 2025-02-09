import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const MetricsPage = () => {
  // 모킹 데이터
  const currentStats = {
    totalUsers: 1200,
    newUsersToday: 25,
    activeUsersToday: 300,
  };

  const weeklyRequestData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "일일 요청 수",
        data: [65, 78, 90, 81, 86, 95, 88],
        borderColor: "#EAFD66",
        backgroundColor: "rgba(234, 253, 102, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const weeklyServiceData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "일일 제공 수",
        data: [55, 68, 80, 75, 82, 91, 85],
        borderColor: "#66FDD2",
        backgroundColor: "rgba(102, 253, 210, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      <div className="space-y-8">
        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#222222] p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium mb-3">
              총 가입자 수
            </h3>
            <p className="text-[#EAFD66] text-4xl font-bold">
              {currentStats.totalUsers}
            </p>
          </div>
          <div className="bg-[#222222] p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium mb-3">
              오늘의 신규 가입자
            </h3>
            <p className="text-[#66FDD2] text-4xl font-bold">
              {currentStats.newUsersToday}
            </p>
          </div>
          <div className="bg-[#222222] p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium mb-3">
              오늘의 활성 사용자
            </h3>
            <p className="text-[#FD66E5] text-4xl font-bold">
              {currentStats.activeUsersToday}
            </p>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-[#222222] p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-lg font-medium mb-6">
              주간 요청 현황
            </h3>
            <div className="p-4">
              <Line data={weeklyRequestData} options={lineOptions} />
            </div>
          </div>
          <div className="bg-[#222222] p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-lg font-medium mb-6">
              주간 제공 현황
            </h3>
            <div className="p-4">
              <Line data={weeklyServiceData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
