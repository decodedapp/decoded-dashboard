import React, { useState } from "react";
import { networkManager } from "@/network/network";

interface CategoryData {
  item_class: string;
  category: {
    [key: string]: any;
  };
}

const CategoryAddPage = () => {
  const [itemClass, setItemClass] = useState("");
  const [categoryData, setCategoryData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemClass || !categoryData) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    let parsedCategory;
    try {
      parsedCategory = JSON.parse(categoryData);
    } catch (error) {
      alert("올바른 JSON 형식이 아닙니다.");
      return;
    }

    const requestBody: CategoryData = {
      item_class: itemClass,
      category: parsedCategory,
    };

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      await networkManager.request(
        `admin/${userDocId}/category/update`,
        "PUT",
        requestBody,
        accessToken
      );

      alert("카테고리가 성공적으로 업데이트되었습니다.");
      setItemClass("");
      setCategoryData("");
    } catch (error) {
      console.error("카테고리 업데이트 실패:", error);
      alert("카테고리 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#222222] shadow rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-400 mb-6">
          카테고리 업데이트
        </h2>
        <form onSubmit={handleCategorySubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              아이템 클래스
            </label>
            <input
              type="text"
              value={itemClass}
              onChange={(e) => setItemClass(e.target.value)}
              placeholder="fashion, furiture, art, etc."
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              카테고리 데이터 (JSON)
            </label>
            <textarea
              value={categoryData}
              onChange={(e) => setCategoryData(e.target.value)}
              placeholder="카테고리 데이터를 JSON 형식으로 입력하세요"
              rows={10}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200 font-mono"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#EAFD66] text-black rounded-lg hover:bg-[#dbed5d] disabled:bg-gray-600 disabled:text-gray-400"
            >
              {isLoading ? "처리중..." : "카테고리 업데이트"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryAddPage;
