import React, { useState } from "react";
import ImageRequestSection from "./ImageRequestSection";
import ConfirmSection from "./ConfirmSection";
import { HiOutlinePhotograph, HiOutlineCheck } from "react-icons/hi";

type ApprovalTabType = "images" | "artists" | "brands" | "confirm";

const ApprovalPage = () => {
  const [currentApprovalTab, setCurrentApprovalTab] =
    useState<ApprovalTabType>("images");

  const tabs = [
    {
      id: "images",
      label: "이미지 요청",
      icon: <HiOutlinePhotograph className="w-5 h-5" />,
    },
    {
      id: "confirm",
      label: "아이템 확정",
      icon: <HiOutlineCheck className="w-5 h-5" />,
    },
  ];

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#222222] rounded-xl shadow-lg">
          <div className="border-b border-gray-800">
            <nav className="flex justify-center p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setCurrentApprovalTab(tab.id as ApprovalTabType)
                  }
                  className={`
                    flex items-center space-x-2 py-3 px-6 rounded-lg mx-2
                    transition-all duration-200 ease-in-out
                    ${
                      currentApprovalTab === tab.id
                        ? "bg-[#2A2A2A] text-[#EAFD66] shadow-lg"
                        : "text-gray-400 hover:bg-[#2A2A2A] hover:text-gray-200"
                    }
                  `}
                >
                  {tab.icon}
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {currentApprovalTab === "images" && (
              <div className="animate-fadeIn">
                <ImageRequestSection />
              </div>
            )}
            {currentApprovalTab === "confirm" && (
              <div className="animate-fadeIn">
                <ConfirmSection />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
