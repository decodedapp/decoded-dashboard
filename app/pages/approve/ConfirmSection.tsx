import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { networkManager } from "@/network/network";
import { convertKeysToCamelCase, convertKeysToSnakeCase } from "@/utils/util";
import {
  BrandDoc,
  ConfirmItemLink,
  PendingItem,
  UpdateItemMetadata,
} from "@/types/model";
import AdditionalFieldsForm from "@/app/components/form/AdditionalFieldsForm";

const ConfirmSection = () => {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMetadataForm, setShowMetadataForm] = useState<{
    [key: string]: boolean;
  }>({});
  const [itemMetadata, setItemMetadata] = useState<{
    [key: string]: UpdateItemMetadata;
  }>({});
  console.log(itemMetadata);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [confirmItemLinks, setConfirmItemLinks] = useState<{
    [key: string]: ConfirmItemLink;
  }>({});
  console.log(confirmItemLinks);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [labels, setLabels] = useState<string[] | null>(null);
  const [brands, setBrands] = useState<BrandDoc[]>([]);
  const [nextId, setNextId] = useState<string | null>(null);
  const { ref, inView } = useInView();

  const toggleSelectItem = (
    itemDocId: string,
    action: "confirm" | "reject",
    url?: string
  ) => {
    const fieldId = `${itemDocId}-${url}`;

    setSelectedItems((prev) => {
      const newSelectedItems = new Set(prev);
      if (newSelectedItems.has(fieldId)) {
        newSelectedItems.delete(fieldId);
      } else {
        newSelectedItems.add(fieldId);
      }
      return newSelectedItems;
    });

    setConfirmItemLinks((prev) => {
      const currentItemLink = prev[itemDocId] || {
        approveLinks: [],
        rejectLinks: [],
        imageDocId: items.find((item) => item.itemDocId === itemDocId)
          ?.imageDocId,
      };

      if (url) {
        if (action === "confirm") {
          currentItemLink.rejectLinks = currentItemLink.rejectLinks?.filter(
            (u) => u !== url
          );
          if (currentItemLink.approveLinks?.some((u) => u.value === url)) {
            currentItemLink.approveLinks = currentItemLink.approveLinks?.filter(
              (u) => u.value !== url
            );
          } else {
            currentItemLink.approveLinks?.push({ value: url, label: "" });
          }
        } else {
          currentItemLink.approveLinks = currentItemLink.approveLinks?.filter(
            (u) => u.value !== url
          );
          if (currentItemLink.rejectLinks?.includes(url)) {
            currentItemLink.rejectLinks = currentItemLink.rejectLinks?.filter(
              (u) => u !== url
            );
          } else {
            currentItemLink.rejectLinks?.push(url);
          }
        }
      }

      return {
        ...prev,
        [itemDocId]: currentItemLink,
      };
    });
  };

  const fetchLabels = async () => {
    const response = await networkManager.request("item/labels", "GET", null);
    setLabels(response.data);
  };

  const fetchBrands = useCallback(async () => {
    try {
      const response = await networkManager.request("brand", "GET", null);
      setBrands(response.data.docs);
    } catch (error) {
      console.error("브랜드 목록을 불러오는데 실패했습니다:", error);
    }
  }, []);

  const fetchPendingItems = async (cursor?: string) => {
    try {
      setSelectedItems(new Set());
      setConfirmItemLinks({});
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const cursorParam = cursor ? `?next_id=${cursor}` : "";
      const response = await networkManager.request(
        `admin/${userDocId}/item/pending-items${cursorParam}`,
        "GET",
        null,
        accessToken
      );

      console.log("[PendingItems]", response.data);

      const convertedData = response.data.items.map((item: any) => {
        return convertKeysToCamelCase(item);
      });

      setItems((prev) =>
        cursor ? [...prev, ...convertedData] : convertedData
      );

      if (response.data.next_id) {
        setNextId(response.data.next_id);
      } else {
        setNextId(null);
      }
    } catch (error) {
      console.error("아이템 정보를 불러오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchPendingItems(), fetchLabels(), fetchBrands()]);
  }, [fetchBrands]);

  useEffect(() => {
    if (inView && nextId && !isLoading && items.length === 0) {
      fetchPendingItems(nextId);
    }
  }, [items.length, inView, isLoading, nextId]);

  useEffect(() => {
    if (inView && nextId && !isLoading) {
      fetchPendingItems(nextId);
    }
  }, [inView, isLoading, nextId]);

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const handleConfirmItemInfo = async (itemDocId: string) => {
    setUploadLoading(true);
    const accessToken = localStorage.getItem("access_token");
    const userDocId = sessionStorage.getItem("USER_DOC_ID");

    if (!userDocId || !accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    const cleanedConfirmLink = {
      ...confirmItemLinks[itemDocId],
      approveLinks: confirmItemLinks[itemDocId]?.approveLinks?.length
        ? confirmItemLinks[itemDocId].approveLinks
        : undefined,
      rejectLinks: confirmItemLinks[itemDocId]?.rejectLinks?.length
        ? confirmItemLinks[itemDocId].rejectLinks
        : undefined,
    };

    console.log(itemMetadata[itemDocId]);
    console.log(cleanedConfirmLink);

    try {
      await networkManager.request(
        `admin/${userDocId}/item/${itemDocId}/confirm`,
        "POST",
        convertKeysToSnakeCase(cleanedConfirmLink),
        accessToken
      );

      if (itemMetadata[itemDocId]) {
        const additionalMetadata = itemMetadata[itemDocId]?.additionalMetadata;
        const base64Image = itemMetadata[itemDocId]?.base64Image;
        await networkManager.request(
          `admin/${userDocId}/item/${itemDocId}/update-metadata`,
          "PATCH",
          {
            additional_metadata: additionalMetadata,
            base64_image: base64Image,
          },
          accessToken
        );
      }

      alert("선택된 아이템 정보가 승인되었습니다.");
      fetchPendingItems();
    } catch (error) {
      console.error("아이템 정보 승인에 실패했습니다:", error);
      alert("아이템 정보 승인에 실패했습니다.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBulkConfirm = async () => {
    setUploadLoading(true);
    try {
      for (const item of items) {
        await handleConfirmItemInfo(item.itemDocId);
      }
      alert("모든 아이템이 일괄 확정되었습니다.");
    } catch (error) {
      console.error("일괄 확정 중 오류가 발생했습니다:", error);
      alert("일괄 확정 중 오류가 발생했습니다.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handLabelSelect = async (
    itemDocId: string,
    link: string,
    label: string
  ) => {
    setConfirmItemLinks((prev) => {
      if (!prev[itemDocId]) return prev;
      return {
        ...prev,
        [itemDocId]: {
          ...prev[itemDocId],
          approveLinks: prev[itemDocId].approveLinks?.map((url) =>
            url.value === link ? { ...url, label } : url
          ),
        },
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-400">아이템 정보 승인</h2>
        <div className="flex gap-4">
          {" "}
          {/* 버튼들을 감싸는 컨테이너 추가 */}
          {items.length > 0 && (
            <button
              onClick={handleBulkConfirm}
              disabled={uploadLoading}
              className={`
              px-4 py-2 rounded-md shadow-sm
              ${
                uploadLoading
                  ? "bg-gray-800 cursor-not-allowed"
                  : "bg-[#EAFD66] hover:bg-[#D9EC55] text-black"
              }
              transition-colors
              min-w-[120px] flex items-center justify-center
            `}
            >
              {uploadLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                  <span>처리중</span>
                </div>
              ) : (
                "일괄 확정"
              )}
            </button>
          )}
          <button
            onClick={() => fetchPendingItems(nextId || undefined)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md shadow-sm hover:bg-gray-700 transition-colors"
          >
            불러오기
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1A1A1A] rounded-2xl border border-gray-700">
          <svg
            className="w-12 h-12 mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="text-xl font-semibold text-[#EAFD66]">
            승인할 아이템이 없습니다
          </h3>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.itemDocId}
              className="bg-[#222222] rounded-xl shadow-sm border border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_APP_HOST}/details/${item.imageDocId}?itemId=${item.itemDocId}`}
                    className="p-2 text-gray-400 hover:text-[#EAFD66] transition-colors rounded-lg hover:bg-white/5"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() =>
                      setShowMetadataForm((prev) => ({
                        ...prev,
                        [item.itemDocId]: !prev[item.itemDocId],
                      }))
                    }
                    className="text-gray-400 hover:text-[#EAFD66] transition-colors"
                  >
                    {showMetadataForm[item.itemDocId]
                      ? "정보 숨기기"
                      : "정보 추가하기"}
                  </button>
                </div>

                {showMetadataForm[item.itemDocId] && (
                  <AdditionalFieldsForm
                    docs={brands}
                    hasFields={{
                      hasBrand: item.additionalMetadata?.brand ? true : false,
                      hasName: item.additionalMetadata?.name ? true : false,
                      hasDescription: item.additionalMetadata?.description
                        ? true
                        : false,
                      hasMaterial: item.additionalMetadata?.material
                        ? true
                        : false,
                      hasDesignedBy: item.additionalMetadata?.designedBy
                        ? true
                        : false,
                      hasColor: item.additionalMetadata?.color ? true : false,
                      hasImage: item.imageUrl ? true : false,
                    }}
                    onUpdate={(fields) => {
                      setItemMetadata((prev) => ({
                        ...prev,
                        [item.itemDocId]: fields,
                      }));
                    }}
                    metadata={undefined}
                  />
                )}
                <div className="space-y-2">
                  {item.pendingLinks && item.pendingLinks.length > 0 && (
                    <div className="space-y-2">
                      {item.pendingLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm gap-2"
                        >
                          <span className="text-gray-500">{index + 1}</span>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex-1"
                          >
                            아이템 링크
                          </a>
                          {confirmItemLinks[item.itemDocId]?.approveLinks?.some(
                            (url) => url.value === link
                          ) && (
                            <select
                              value={
                                confirmItemLinks[
                                  item.itemDocId
                                ]?.approveLinks?.find(
                                  (url) => url.value === link
                                )?.label || ""
                              }
                              onChange={(e) =>
                                handLabelSelect(
                                  item.itemDocId,
                                  link,
                                  e.target.value
                                )
                              }
                              className="text-xs px-2 py-1 rounded border border-gray-700 bg-[#1A1A1A] text-gray-700 w-full max-w-[120px]"
                            >
                              <option value="" disabled>
                                라벨 선택
                              </option>
                              {labels?.map((label) => (
                                <option key={label} value={label}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() =>
                                toggleSelectItem(
                                  item.itemDocId,
                                  "confirm",
                                  link
                                )
                              }
                              className={`p-1.5 rounded-full transition-colors ${
                                confirmItemLinks[
                                  item.itemDocId
                                ]?.approveLinks?.some(
                                  (url) => url.value === link
                                )
                                  ? "bg-green-100 text-green-600"
                                  : "hover:bg-gray-100 text-gray-400"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                toggleSelectItem(item.itemDocId, "reject", link)
                              }
                              className={`p-1.5 rounded-full transition-colors ${
                                confirmItemLinks[
                                  item.itemDocId
                                ]?.rejectLinks?.includes(link)
                                  ? "bg-red-100 text-red-600"
                                  : "hover:bg-gray-100 text-gray-400"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleConfirmItemInfo(item.itemDocId)}
                    disabled={uploadLoading}
                    className={`
                      px-4 py-2 rounded-md shadow-sm
                      ${
                        uploadLoading
                          ? "bg-gray-800 cursor-not-allowed"
                          : "bg-gray-800 hover:bg-gray-700"
                      }
                      text-white transition-colors
                      min-w-[80px] flex items-center justify-center
                    `}
                  >
                    {uploadLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                        <span>처리중</span>
                      </div>
                    ) : (
                      "확정"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {nextId && (
        <div
          ref={ref}
          className="w-full h-10 flex items-center justify-center mt-4"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400" />
          )}
        </div>
      )}
    </div>
  );
};

export default ConfirmSection;
