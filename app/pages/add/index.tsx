import React, { useState } from "react";
import IdentityAddPage from "./IdentityAddPage";
import BrandAddPage from "./BrandAddPage";
import CurationAddPage from "./CurationAddPage";
import CategoryAddPage from "./CategoryAddPage";
import MetadataAddPage from "./MetadataAddPage";

type AddType = "identity" | "brand" | "curation" | "category" | "metadata";

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
          <button
            onClick={() => setCurrentTab("metadata")}
            className={`py-2 px-4 -mb-px ${
              currentTab === "metadata"
                ? "border-b-2 border-[#EAFD66] text-[#EAFD66]"
                : "text-gray-400"
            }`}
          >
            메타데이터 추가
          </button>
        </div>
      </div>

      {currentTab === "identity" && <IdentityAddPage />}
      {currentTab === "brand" && <BrandAddPage />}
      {currentTab === "curation" && <CurationAddPage />}
      {currentTab === "category" && <CategoryAddPage />}
      {currentTab === "metadata" && <MetadataAddPage />}
    </div>
  );
};

export default AddPage;
