import React, { useState } from "react";
import IdentityAddPage from "./pages/add/IdentityAddPage";
import BrandAddPage from "./pages/add/BrandAddPage";
import CurationAddPage from "./pages/add/CurationAddPage";
import CategoryAddPage from "./pages/add/CategoryAddPage";

type AddType = "identity" | "brand" | "curation" | "category";

const AddPage = () => {
  const [currentTab, setCurrentTab] = useState<AddType>("identity");

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setCurrentTab("identity")}
            className={`py-2 px-4 -mb-px ${
              currentTab === "identity"
                ? "border-b-2 border-[#EAFD66] text-[#EAFD66]"
                : "text-gray-400"
            }`}
          >
            아이덴티티 추가
          </button>
          <button
            onClick={() => setCurrentTab("brand")}
            className={`py-2 px-4 -mb-px ${
              currentTab === "brand"
                ? "border-b-2 border-[#EAFD66] text-[#EAFD66]"
                : "text-gray-400"
            }`}
          >
            브랜드 추가
          </button>
          <button
            onClick={() => setCurrentTab("curation")}
            className={`py-2 px-4 -mb-px ${
              currentTab === "curation"
                ? "border-b-2 border-[#EAFD66] text-[#EAFD66]"
                : "text-gray-400"
            }`}
          >
            큐레이션 추가
          </button>
          <button
            onClick={() => setCurrentTab("category")}
            className={`py-2 px-4 -mb-px ${
              currentTab === "category"
                ? "border-b-2 border-[#EAFD66] text-[#EAFD66]"
                : "text-gray-400"
            }`}
          >
            카테고리 추가
          </button>
        </div>
      </div>

      {currentTab === "identity" && <IdentityAddPage />}
      {currentTab === "brand" && <BrandAddPage />}
      {currentTab === "curation" && <CurationAddPage />}
      {currentTab === "category" && <CategoryAddPage />}
    </div>
  );
};

export default AddPage;
