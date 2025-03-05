import React, { useState } from "react";
import CurationAddPage from "./CurationAddPage";
import UpdateCuration from "./CurationUpdatePage";

const CurationPage = () => {
  const [activeTab, setActiveTab] = useState<"list" | "add" | "update">("list");
  const [selectedCurationId, setSelectedCurationId] = useState<string | null>(
    null
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`${
                activeTab === "list"
                  ? "border-[#EAFD66] text-[#EAFD66]"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              큐레이션 목록
            </button>
            <button
              onClick={() => {
                setActiveTab("add");
                setSelectedCurationId(null);
              }}
              className={`${
                activeTab === "add"
                  ? "border-[#EAFD66] text-[#EAFD66]"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              새 큐레이션
            </button>
          </nav>
        </div>
      </div>
      {activeTab === "add" && <CurationAddPage />}
      {activeTab === "update" && <UpdateCuration />}
    </div>
  );
};

export default CurationPage;
