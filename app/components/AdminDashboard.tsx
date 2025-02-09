import React, { useEffect, useState } from "react";
import AdminLogin from "./login/login";
import MetricsPage from "./MetricsPage";
import ApprovalPage from "./ApprovalPage";

type TabType = "metrics" | "approval";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("metrics");
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => {
    setIsAdmin(true);
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedAdminStatus = localStorage.getItem("isAdmin");
      if (storedAdminStatus === "true") {
        setIsAdmin(true);
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
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

          <AdminLogin onLogin={handleLogin} />

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
        </nav>
      </div>

      <div className="mt-6">
        {currentTab === "metrics" && <MetricsPage />}
        {currentTab === "approval" && <ApprovalPage />}
      </div>
    </div>
  );
};

export default AdminDashboard;
