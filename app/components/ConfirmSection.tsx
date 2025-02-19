import React, { useState, useEffect } from "react";
import Link from "next/link";
import { networkManager } from "@/network/network";
import {
  arrayBufferToBase64,
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
} from "@/utils/util";
import {
  ProvideItemInfoWithMetadata,
  ConfirmItemInfo,
  HasFields,
  MetadataResponse,
  AdditionalMetadata,
  BrandDoc,
} from "@/types/model";
import AdditionalFieldsForm from "./AdditionalFieldsForm";

const ConfirmSection = () => {
  const [items, setItems] = useState<ProvideItemInfoWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [confirmItemInfo, setConfirmItemInfo] =
    useState<ConfirmItemInfo | null>(null);
  const [hasFields, setHasFields] = useState<Record<string, HasFields>>({});
  const [selectedFile, setSelectedFile] = useState<Record<string, File>>({});
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, MetadataResponse>>(
    {}
  );
  const [brands, setBrands] = useState<BrandDoc[]>([]);

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

    setConfirmItemInfo((prev) => {
      const newRequest: ConfirmItemInfo = {
        approveUrls: prev ? [...(prev.approveUrls || [])] : undefined,
        rejectUrls: prev ? [...(prev.rejectUrls || [])] : undefined,
        additionalMetadata: prev?.additionalMetadata || undefined,
        base64Image: prev?.base64Image,
        imageDocId: prev?.imageDocId,
      };

      if (url) {
        if (action === "confirm") {
          newRequest.rejectUrls = newRequest.rejectUrls?.filter(
            (u) => u !== url
          );

          if (newRequest.approveUrls?.some((u) => u.url === url)) {
            newRequest.approveUrls = newRequest.approveUrls?.filter(
              (u) => u.url !== url
            );
          } else {
            newRequest.approveUrls?.push({ url, label: "" });
          }
        } else {
          newRequest.approveUrls = newRequest.approveUrls?.filter(
            (u) => u.url !== url
          );

          if (newRequest.rejectUrls?.includes(url)) {
            newRequest.rejectUrls = newRequest.rejectUrls?.filter(
              (u) => u !== url
            );
          } else {
            newRequest.rejectUrls?.push(url);
          }
        }
      }

      return newRequest.approveUrls?.length === 0 &&
        newRequest.rejectUrls?.length === 0
        ? null
        : newRequest;
    });
  };

  const fetchBrands = async () => {
    try {
      const response = await networkManager.request("brand", "GET", null);
      const brand_docs = response.data.brands;
      setBrands(
        brand_docs.map((brand: any) => ({
          name: { ko: brand.name.ko, en: brand.name.en },
          docId: brand._id,
        }))
      );
    } catch (error) {
      console.error("브랜드 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const fetchUnconfirmedItems = async () => {
    try {
      setSelectedItems(new Set());
      setConfirmItemInfo(null);
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
      }
      const response = await networkManager.request(
        `admin/${userDocId}/item/provided`,
        "GET",
        null,
        accessToken
      );
      setLabels(response.data.labels);
      const convertedData = response.data.items.map((item: any) => {
        return convertKeysToCamelCase(item);
      });
      setItems(convertedData);
      convertedData.forEach((item: any) => {
        setHasFields((prev) => ({
          ...prev,
          [item.itemDocId]: item.hasFields,
        }));
      });
    } catch (error) {
      console.error("아이템 정보를 불러오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchUnconfirmedItems(), fetchBrands()]);
  }, []);

  const handleConfirmItemInfo = async (itemDocId: string) => {
    setUploadLoading(true);
    const converted = convertKeysToSnakeCase(confirmItemInfo);
    const fields = [];
    if (
      confirmItemInfo?.approveUrls !== undefined &&
      confirmItemInfo?.approveUrls.length == 0
    ) {
      confirmItemInfo.approveUrls = undefined;
    }
    if (
      confirmItemInfo?.rejectUrls !== undefined &&
      confirmItemInfo?.rejectUrls.length == 0
    ) {
      confirmItemInfo.rejectUrls = undefined;
    }
    const accessToken = localStorage.getItem("access_token");
    const userDocId = sessionStorage.getItem("USER_DOC_ID");
    try {
      await networkManager.request(
        `admin/${userDocId}/item/${itemDocId}/confirm`,
        "POST",
        converted,
        accessToken
      );
      alert("선택된 아이템이 확정되었습니다.");
      fetchUnconfirmedItems();
    } catch (error) {
      console.error("아이템 확정에 실패했습니다:", error);
      alert("아이템 확정에 실패했습니다.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    imageDocId: string,
    itemDocId: string
  ) => {
    try {
      const buffer = await file.arrayBuffer();
      const base64Image = arrayBufferToBase64(buffer);

      setSelectedFile((prev) => ({
        ...prev,
        [itemDocId]: file,
      }));

      setConfirmItemInfo((prev) => {
        if (!prev) {
          return {
            imageDocId,
            itemDocId,
            approveUrls: [],
            base64Image,
          };
        }
        return {
          ...prev,
          base64Image,
        };
      });
    } catch (error) {
      console.error("이미지 변환 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  const handLabelSelect = async (
    itemDocId: string,
    link: string,
    label: string
  ) => {
    if (label === "sale") {
      try {
        const response = await networkManager.request(
          "api/metadata/extract?url=" + link,
          "POST",
          null,
          null,
          true
        );
        setMetadata((prev) => ({
          ...prev,
          [itemDocId]: response,
        }));
      } catch (error) {
        console.error("메타데이터 추출 실패:", error);
      }
    }
    setConfirmItemInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        approveUrls: prev.approveUrls?.map((url) =>
          url.url === link ? { ...url, label } : url
        ),
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
        <h2 className="text-2xl font-bold text-gray-400">아이템 정보 확정</h2>
        <button
          onClick={fetchUnconfirmedItems}
          className="px-4 py-2 bg-gray-800 text-white rounded-md shadow-sm hover:bg-gray-700 transition-colors"
        >
          불러오기
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="flex flex-col items-center justify-center space-y-4 px-4">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              확정할 아이템이 없습니다
            </h3>
            <p className="text-gray-500 max-w-sm text-center leading-relaxed">
              제공된 아이템 정보를 확인하고 확정하세요
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.itemDocId}
              className="bg-[#222222] rounded-xl shadow-sm border border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6 space-y-4">
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
                <div className="relative w-full aspect-square bg-[#1A1A1A] rounded-lg">
                  {!hasFields.hasImage && (
                    <label
                      htmlFor={`image-upload-${item.itemDocId}`}
                      className="inset-0 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      {selectedFile[item.itemDocId] ? (
                        <div className="relative w-full h-full aspect-square">
                          <img
                            src={URL.createObjectURL(
                              selectedFile[item.itemDocId]
                            )}
                            alt="Preview"
                            className="object-cover w-full h-full rounded-lg aspect-square"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                            <button className="px-4 py-2 bg-[#1A1A1A] rounded-md shadow-sm text-sm font-medium text-gray-700">
                              이미지 변경
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700">
                          아이템 이미지 업로드
                        </button>
                      )}
                    </label>
                  )}
                  <input
                    id={`image-upload-${item.itemDocId}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(
                          file,
                          item.imageDocId,
                          item.itemDocId
                        );
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  {item.unconfirmedLinks &&
                    item.unconfirmedLinks.length > 0 && (
                      <div className="space-y-2">
                        {item.unconfirmedLinks.map((link, index) => (
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
                            {confirmItemInfo?.approveUrls?.some(
                              (url) => url.url === link
                            ) && (
                              <select
                                value={
                                  confirmItemInfo?.approveUrls?.find(
                                    (url) => url.url === link
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
                                {labels.map((label) => (
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
                                  confirmItemInfo?.approveUrls?.some(
                                    (url) => url.url === link
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
                                  toggleSelectItem(
                                    item.itemDocId,
                                    "reject",
                                    link
                                  )
                                }
                                className={`p-1.5 rounded-full transition-colors ${
                                  confirmItemInfo?.rejectUrls?.includes(link)
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
                <AdditionalFieldsForm
                  docs={brands}
                  hasFields={hasFields[item.itemDocId]}
                  metadata={metadata[item.itemDocId]}
                  onUpdate={(fields) => {
                    setConfirmItemInfo((prev) => {
                      if (prev) {
                        return {
                          ...prev,
                          additionalMetadata: fields,
                        };
                      } else {
                        return {
                          itemDocId: item.itemDocId,
                          approveUrls: [],
                          additionalMetadata: fields,
                        };
                      }
                    });
                  }}
                />
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
    </div>
  );
};

export default ConfirmSection;
