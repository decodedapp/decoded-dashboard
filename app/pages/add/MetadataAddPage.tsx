import React, { useState, useEffect, useCallback } from "react";
import { networkManager } from "@/network/network";
import { useInView } from "react-intersection-observer";
import AdditionalFieldsForm from "@/app/components/form/AdditionalFieldsForm";
import {
  AdditionalMetadata,
  BrandDoc,
  UpdateItemMetadata,
} from "@/types/model";

interface NotDecodedItem {
  item_doc_id: string;
  image_url?: string;
  additional_metadata?: AdditionalMetadata;
}

const MetadataAddPage = () => {
  const [items, setItems] = useState<NotDecodedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextId, setNextId] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandDoc[]>([]);
  console.log("[brands]", brands);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemMetadata, setItemMetadata] = useState<{
    [key: string]: UpdateItemMetadata;
  }>({});
  console.log("[itemMetadata]", itemMetadata);
  const [itemImages, setItemImages] = useState<{ [key: string]: string }>({});
  const { ref, inView } = useInView();

  const fetchItems = useCallback(async (cursor?: string) => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const cursorParam = cursor ? `?next_id=${cursor}` : "";
      const response = await networkManager.request(
        `admin/${userDocId}/item/not-decoded${cursorParam}`,
        "GET",
        null,
        accessToken
      );
      console.log(response.data);
      const newItems = response.data.items;
      setItems((prev) => (cursor ? [...prev, ...newItems] : newItems));
      setNextId(response.data.next_id || null);
    } catch (error) {
      console.error("아이템 정보를 불러오는데 실패했습니다:", error);
      alert("아이템을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await networkManager.request("brand", "GET", null);
      setBrands(response.data.docs);
    } catch (error) {
      console.error("브랜드 목록을 불러오는데 실패했습니다:", error);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleMetadataUpdate = async (itemDocId: string) => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      await networkManager.request(
        `admin/${userDocId}/item/${itemDocId}/update-metadata`,
        "PATCH",
        {
          base64_image: itemImages[itemDocId],
          additional_metadata: itemMetadata[itemDocId],
        },
        accessToken
      );

      alert("메타데이터가 성공적으로 업데이트되었습니다.");
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemDocId);
        return newSet;
      });
    } catch (error) {
      console.error("메타데이터 업데이트 실패:", error);
      alert("메타데이터 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0) {
      alert("업데이트할 아이템을 선택해주세요.");
      return;
    }

    const isConfirmed = window.confirm(
      `선택한 ${selectedItems.size}개의 아이템을 업데이트하시겠습니까?`
    );
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      const updatePromises = Array.from(selectedItems).map((itemId) =>
        handleMetadataUpdate(itemId)
      );
      await Promise.all(updatePromises);
      alert("모든 아이템이 성공적으로 업데이트되었습니다.");
      setSelectedItems(new Set());
    } catch (error) {
      console.error("일괄 업데이트 실패:", error);
      alert("일부 아이템 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (inView && nextId && !isLoading) {
      fetchItems(nextId);
    }
  }, [inView, nextId, isLoading, fetchItems]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-400">메타데이터 추가</h2>
        <div className="flex gap-4">
          <button
            onClick={handleBulkUpdate}
            disabled={isLoading || selectedItems.size === 0}
            className="px-4 py-2 bg-[#EAFD66] text-black rounded-lg hover:bg-[#dbed5d] disabled:bg-gray-600 disabled:text-gray-400"
          >
            {isLoading ? "처리중..." : "일괄 업데이트"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.item_doc_id}
            className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-gray-700"
          >
            <div className="p-4">
              <AdditionalFieldsForm
                docs={brands}
                hasFields={{
                  hasImage: item.image_url ? true : false,
                  hasBrand: item.additional_metadata?.brand ? true : false,
                  hasName: item.additional_metadata?.name ? true : false,
                  hasDescription: item.additional_metadata?.description
                    ? true
                    : false,
                  hasMaterial: item.additional_metadata?.material
                    ? true
                    : false,
                  hasDesignedBy: item.additional_metadata?.designedBy
                    ? true
                    : false,
                }}
                onUpdate={(fields) => {
                  setItemMetadata((prev) => ({
                    ...prev,
                    [item.item_doc_id]: fields,
                  }));
                  setSelectedItems(
                    (prev) => new Set(Array.from(prev).concat(item.item_doc_id))
                  );
                }}
                metadata={item.additional_metadata}
              />
            </div>
          </div>
        ))}
      </div>

      <div ref={ref} className="w-full py-4 flex justify-center">
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">로딩 중...</span>
          </div>
        )}
      </div>

      {items.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          메타데이터를 추가할 아이템이 없습니다.
        </div>
      )}
    </div>
  );
};

export default MetadataAddPage;
