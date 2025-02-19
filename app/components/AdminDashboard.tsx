import React, { useEffect, useState } from "react";
import AdminLogin from "./login/login";
import MetricsPage from "./MetricsPage";
import ApprovalPage from "./ApprovalPage";
import AddPage from "./AddPage";

type TabType = "metrics" | "approval" | "add";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("metrics");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsAdmin(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#070707]">
        <div className="max-w-md w-full p-8">
          <div className="text-center space-y-6">
            {/* 로고나 아이콘 */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1A1A] shadow-lg">
              <svg
                className="w-8 h-8 text-[#EAFD66]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* 텍스트 */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-300">
                관리자 로그인
              </h2>
              <p className="text-sm text-gray-500">
                관리자 권한을 확인하고 있습니다
              </p>
            </div>

            {/* 로딩 인디케이터 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-[#EAFD66] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#EAFD66]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#070707]">
        <div className="max-w-md w-full space-y-8 p-6 bg-[#070707] rounded-lg shadow-lg">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-400">관리자 로그인</h2>
            <p className="mt-2 text-sm text-gray-600">
              계속하려면 관리자 계정으로 로그인해주세요
            </p>
          </div>

          <AdminLogin setIsLoading={setIsLoading} onLogin={handleLogin} />

          <div className="text-center text-sm text-gray-500">
            <p>관리자 권한이 필요한 페이지입니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707]">
      <div className="bg-[#070707] shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 px-2">
            <h1
              className="text-2xl font-bold text-gray-400 cursor-pointer"
              onClick={() => setIsAdmin(false)}
            >
              관리자 대시보드
            </h1>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        <nav className="flex justify-center space-x-12">
          <button
            onClick={() => setCurrentTab("metrics")}
            className={`
              group flex items-center px-1 py-2.5 relative
              transition-all duration-200 ease-in-out
            `}
          >
            <svg
              className={`w-4 h-4 mr-2 transition-colors ${
                currentTab === "metrics"
                  ? "text-[#EAFD66]"
                  : "text-gray-400 group-hover:text-gray-200"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span
              className={`text-sm font-medium transition-colors ${
                currentTab === "metrics"
                  ? "text-[#EAFD66]"
                  : "text-gray-400 group-hover:text-gray-200"
              }`}
            >
              메트릭
            </span>
            {/* 하단 인디케이터 라인 */}
            <div
              className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-200 transform ${
                currentTab === "metrics"
                  ? "bg-[#EAFD66] scale-x-100"
                  : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-400"
              }`}
            />
          </button>

          <button
            onClick={() => setCurrentTab("approval")}
            className={`
              group flex items-center px-1 py-2.5 relative
              transition-all duration-200 ease-in-out
            `}
          >
            <svg
              className={`w-4 h-4 mr-2 transition-colors ${
                currentTab === "approval"
                  ? "text-[#EAFD66]"
                  : "text-gray-400 group-hover:text-gray-200"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={`text-sm font-medium transition-colors ${
                currentTab === "approval"
                  ? "text-[#EAFD66]"
                  : "text-gray-400 group-hover:text-gray-200"
              }`}
            >
              승인
            </span>
            {/* 하단 인디케이터 라인 */}
            <div
              className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-200 transform ${
                currentTab === "approval"
                  ? "bg-[#EAFD66] scale-x-100"
                  : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-400"
              }`}
            />
          </button>
          <button
            onClick={() => setCurrentTab("add")}
            className={`
              group flex items-center px-1 py-2.5 relative
              transition-all duration-200 ease-in-out
            `}
          >
            <svg
              className={`w-4 h-4 mr-2 transition-colors ${
                currentTab === "add"
                  ? "text-[#EAFD66]"
                  : "text-gray-400 group-hover:text-gray-200"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span
              className={`text-sm font-medium transition-colors ${
                currentTab === "add"
                  ? "text-[#EAFD66]"
                  : "text-gray-400 group-hover:text-gray-200"
              }`}
            >
              추가
            </span>
            {/* 하단 인디케이터 라인 */}
            <div
              className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-200 transform ${
                currentTab === "add"
                  ? "bg-[#EAFD66] scale-x-100"
                  : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-400"
              }`}
            />
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {currentTab === "metrics" && <MetricsPage />}
        {currentTab === "approval" && <ApprovalPage />}
        {currentTab === "add" && <AddPage />}
      </div>
    </div>
  );
};

export default AdminDashboard;
