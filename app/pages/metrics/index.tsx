import React, { useEffect, useState } from "react";
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
import { networkManager } from "@/network/network";

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

interface DailyMetrics {
  daily_new_users: number;
  daily_active_users: number;
  daily_request_images: number;
  daily_request_items: number;
  daily_provides: number;
}

interface TotalMetrics {
  total_images_requested: number;
  total_items_requested: number;
  total_links_provided: number;
  total_users: number;
}

const MetricsPage = () => {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics | null>(null);
  const [totalMetrics, setTotalMetrics] = useState<TotalMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const [dailyResponse, totalResponse] = await Promise.all([
        networkManager.request("daily/metrics", "GET", null),
        networkManager.request("total/metrics", "GET", null),
      ]);

      if (dailyResponse.status_code === 200) {
        setDailyMetrics(dailyResponse.data);
      }
      if (totalResponse.status_code === 200) {
        setTotalMetrics(totalResponse.data);
      }
    } catch (error) {
      console.error("메트릭스 데이터 가져오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const weeklyRequestData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "이미지 요청",
        data: [65, 78, 90, 81, 86, 95, 88],
        borderColor: "#EAFD66",
        backgroundColor: "rgba(234, 253, 102, 0.1)",
        tension: 0.4,
      },
      {
        label: "아이템 요청",
        data: [45, 58, 70, 61, 76, 85, 78],
        borderColor: "#FD66E5",
        backgroundColor: "rgba(253, 102, 229, 0.1)",
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">메트릭스</h2>
          <button
            onClick={fetchMetrics}
            className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            새로고침
          </button>
        </div>

        {/* 전체 통계 */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6">
          <h3 className="text-lg font-medium text-gray-400 mb-6">전체 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">총 가입자 수</span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-[#EAFD66]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
              </div>
              <p className="text-[#EAFD66] text-4xl font-bold mb-2">
                {isLoading
                  ? "-"
                  : totalMetrics?.total_users.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">총 이미지 요청</span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-[#66FDD2]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </div>
              </div>
              <p className="text-[#66FDD2] text-4xl font-bold mb-2">
                {isLoading
                  ? "-"
                  : totalMetrics?.total_images_requested.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">총 아이템 요청</span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-[#FD66E5]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-[#FD66E5] text-4xl font-bold mb-2">
                {isLoading
                  ? "-"
                  : totalMetrics?.total_items_requested.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">총 제공 수</span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-white text-4xl font-bold mb-2">
                {isLoading
                  ? "-"
                  : totalMetrics?.total_links_provided.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* 일일 통계 */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6">
          <h3 className="text-lg font-medium text-gray-400 mb-6">일일 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">
                  오늘의 신규 가입자
                </span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-[#EAFD66]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  </svg>
                </div>
              </div>
              <p className="text-[#EAFD66] text-4xl font-bold mb-2">
                {isLoading ? "-" : dailyMetrics?.daily_new_users ?? 0}
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">
                  오늘의 활성 사용자
                </span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-[#66FDD2]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </div>
              <p className="text-[#66FDD2] text-4xl font-bold mb-2">
                {isLoading ? "-" : dailyMetrics?.daily_active_users ?? 0}
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">오늘의 제공 수</span>
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <svg
                    className="w-4 h-4 text-[#FD66E5]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path
                      fillRule="evenodd"
                      d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-[#FD66E5] text-4xl font-bold mb-2">
                {isLoading ? "-" : dailyMetrics?.daily_provides ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* 요청 상세 및 차트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1A1A1A] p-6 rounded-2xl">
            <h3 className="text-lg font-medium text-gray-400 mb-6">
              오늘의 요청 상세
            </h3>
            <div className="bg-[#222222] p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center p-4 border border-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-[#2A2A2A] p-2 rounded-lg mr-3">
                    <svg
                      className="w-4 h-4 text-[#EAFD66]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                  <span className="text-gray-400">이미지 요청</span>
                </div>
                <span className="text-[#EAFD66] font-bold text-xl">
                  {isLoading ? "-" : dailyMetrics?.daily_request_images ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-[#2A2A2A] p-2 rounded-lg mr-3">
                    <svg
                      className="w-4 h-4 text-[#FD66E5]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <span className="text-gray-400">아이템 요청</span>
                </div>
                <span className="text-[#FD66E5] font-bold text-xl">
                  {isLoading ? "-" : dailyMetrics?.daily_request_items ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-2xl">
            <h3 className="text-lg font-medium text-gray-400 mb-6">
              주간 요청 현황
            </h3>
            <div className="bg-[#222222] p-6 rounded-xl">
              <Line data={weeklyRequestData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
