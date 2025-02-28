import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { networkManager } from "@/network/network";
import { convertKeysToCamelCase } from "@/utils/util";
import { ImagePreviewModal } from "./modal/image";
import {
  Category,
  CategoryDoc,
  IdentityDocument,
  ItemWithIdentity,
  RequestedItem,
} from "@/types/model";
import { IdentitySelector } from "./identitySelector";
import { CategorySelector } from "./categorySelector";
import { MobileView } from "../mobile/ImageRequest";

interface HeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  handleBulkUpload: () => void;
  handleBulkDelete: () => void;
}

const ImageRequestSection = () => {
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set()
  );
  const [imageRequests, setImageRequests] = useState<any[]>([]);
  console.log(imageRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [nextId, setNextId] = useState(null);
  const [itemsWithIdentity, setItemsWithIdentity] = useState<{
    [index: number]: ItemWithIdentity;
  }>({});
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [identities, setIdentities] = useState<IdentityDocument[]>([]);
  const { ref, inView } = useInView();

  useEffect(() => {
    Promise.all([fetchCategories(), fetchImageRequests(), fetchIdentities()]);
  }, []);

  const openModal = (request: any) => {
    setOpenModalId(request.Id);
  };

  // For check box
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(imageRequests.map((req) => req.Id)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(requestId);
    } else {
      newSelected.delete(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleUploadImage = async (index: number, isBulk: boolean = false) => {
    const request = imageRequests[index];
    const items = itemsWithIdentity[index];
    const _record: Record<string, RequestedItem[]> = {};
    if (!items.identity_doc_id || !items.item) {
      console.log("Something wrong with `items` data");
      return;
    }
    _record[items.identity_doc_id] = [items.item];
    const requestWithArrayStyle = {
      ...request.doc,
      style:
        !request.doc.style || request.doc.style === ""
          ? null
          : [request.doc.style],
    };
    const accessToken = localStorage.getItem("access_token");
    const userDocId = sessionStorage.getItem("USER_DOC_ID");
    if (!userDocId) {
      alert("로그인이 필요합니다.");
      return;
    }
    const isNew: boolean = request.metadata.isNew;
    if (isNew) {
      const uploadImage = {
        imageBase: requestWithArrayStyle,
        itemsWithIdentity: _record,
        identityName: items.identity_name,
      };

      await networkManager
        .request(
          `admin/${userDocId}/image/upload/${request.Id}`,
          "POST",
          uploadImage,
          accessToken
        )
        .then(() => {
          alert("이미지 업로드 완료");
          fetchImageRequests();
        })
        .catch((err) => {
          alert("이미지 업로드 실패");
          console.error(err);
        });
    } else {
      const updateItem = {
        requestBy: request.requestBy,
        requestDocId: request.Id,
        items: _record,
        identityName: items.identity_name,
      };
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      await networkManager
        .request(
          `admin/${userDocId}/image/${request.metadata.imageDocId}/add`,
          "PATCH",
          updateItem,
          accessToken
        )
        .then(() => {
          if (!isBulk) {
            alert("아이템 업데이트 완료");
          }
          fetchImageRequests();
        });
    }
  };

  const fetchImageRequests = async (cursor?: string) => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const cursorParam = cursor ? `&next_id=${cursor}` : "";
      const res = await networkManager.request(
        `admin/${userDocId}/request?doc_type=images${cursorParam}`,
        "GET",
        null,
        accessToken
      );

      const requests = convertKeysToCamelCase(res?.data.requests) || [];
      setImageRequests((prev) => (cursor ? [...prev, ...requests] : requests));
      if (res.data.next_id) {
        setNextId(res.data.next_id);
      }
    } catch (error) {
      alert("이미지 요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIdentities = async (nextId?: string) => {
    try {
      const endpoint = nextId ? `identity?next_id=${nextId}` : "identity";

      const res = await networkManager.request(endpoint, "GET", null);

      const newIdentities = res.data.docs.map((identity: any) => ({
        name: identity.name,
        category: identity.category,
        id: identity._id,
        profileImageUrl: identity.profile_image_url,
      }));

      if (!nextId) {
        setIdentities(newIdentities);
      } else {
        setIdentities((prev) => [...prev, ...newIdentities]);
      }

      if (res.data.next_id) {
        await fetchIdentities(res.data.next_id);
      }
    } catch (error) {
      console.error("Failed to fetch identities:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await networkManager.request("category/all", "GET", null);
      setCategories(res.data.item_classes);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    if (inView && nextId && !isLoading) {
      fetchImageRequests(nextId);
    }
  }, [inView, nextId, isLoading]);

  const handleDeleteRequest = async (
    requestId: string,
    isBulk: boolean = false
  ) => {
    if (!isBulk) {
      const isConfirmed = window.confirm("정말로 이 요청을 삭제하시겠습니까?");
      if (!isConfirmed) return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
      }
      await networkManager.request(
        `admin/${userDocId}/request/delete/${requestId}`,
        "DELETE",
        null,
        accessToken
      );
      fetchImageRequests();
    } catch (error: any) {
      console.error("요청 삭제 실패:", error);
      alert("요청 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleBulkUpload = async () => {
    const validIndexes = Object.keys(itemsWithIdentity)
      .map(Number)
      .filter((index) => {
        const items = itemsWithIdentity[index];
        return items.identity_doc_id && items.item;
      });

    if (validIndexes.length === 0) {
      alert("업로드할 수 있는 요청이 없습니다.");
      return;
    }

    const isConfirmed = window.confirm(
      `${validIndexes.length}개의 요청을 업로드하시겠습니까?`
    );
    if (!isConfirmed) return;

    try {
      setIsLoading(true);

      // uploadBy로 요청들을 그룹화
      const requestsByUser = validIndexes.reduce((acc, index) => {
        const request = imageRequests[index];
        const uploadBy = request.doc.uploadBy;
        if (!acc[uploadBy]) {
          acc[uploadBy] = [];
        }
        acc[uploadBy].push(index);
        return acc;
      }, {} as Record<string, number[]>);

      // 각 사용자별로 순차 처리하되, 다른 사용자들은 병렬 처리
      const userPromises = Object.entries(requestsByUser).map(
        async ([_, indexes]) => {
          // 같은 사용자의 요청은 순차 처리
          for (const index of indexes) {
            await handleUploadImage(index, true);
          }
        }
      );

      await Promise.all(userPromises);
      alert("모든 이미지 업로드가 완료되었습니다.");
    } catch (error) {
      console.error("일괄 업로드 실패:", error);
      alert("일부 이미지 업로드에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRequests.size === 0) {
      alert("삭제할 요청을 선택해주세요.");
      return;
    }

    const isConfirmed = window.confirm(
      `선택한 ${selectedRequests.size}개의 요청을 삭제하시겠습니까?`
    );
    if (!isConfirmed) return;

    try {
      setIsLoading(true);
      const deletePromises = Array.from(selectedRequests).map((requestId) =>
        handleDeleteRequest(requestId, true)
      );

      await Promise.all(deletePromises);
      setSelectedRequests(new Set());
    } catch (error) {
      console.error("일괄 삭제 실패:", error);
      alert("일부 요청 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onIdentitySelect = (
    index: number,
    identityId: string,
    identityName: string
  ) => {
    setItemsWithIdentity((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        identity_doc_id: identityId,
        identity_name: identityName,
      },
    }));
  };

  const onCategorySelect = (index: number, path: string[]) => {
    setItemsWithIdentity((prev) => {
      const updatedItems = { ...prev };
      const request = imageRequests[index];
      const context = request.doc.requestedItems[0].context;
      const position = request.doc.requestedItems[0].position;

      if (!position) {
        alert("Something wrong with `position` data");
        return updatedItems;
      }

      switch (path.length) {
        case 3:
          updatedItems[index] = {
            ...updatedItems[index],
            item: {
              position: position,
              context: context,
              itemClass: path[0],
              itemSubClass: path[1],
              productType: path[2],
            },
          };
          break;

        case 4:
          updatedItems[index] = {
            ...updatedItems[index],
            item: {
              position: position,
              itemClass: path[0],
              itemSubClass: path[1],
              category: path[2],
              productType: path[3],
            },
          };
          break;

        case 5:
          updatedItems[index] = {
            ...updatedItems[index],
            item: {
              position: position,
              itemClass: path[0],
              itemSubClass: path[1],
              category: path[2],
              subCategory: path[3],
              productType: path[4],
            },
          };
          break;
      }

      setItemsWithIdentity(updatedItems);
      return updatedItems;
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Header
        isLoading={isLoading}
        onRefresh={() => fetchImageRequests()}
        handleBulkUpload={handleBulkUpload}
        handleBulkDelete={handleBulkDelete}
      />

      <div className="hidden sm:block">
        <div className="bg-[#222222] shadow rounded-lg overflow-visible">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#1A1A1A]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  <input
                    type="checkbox"
                    checked={selectedRequests.size === imageRequests.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[#EAFD66] focus:ring-[#EAFD66]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이미지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                  아이덴티티
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#222222] divide-y divide-gray-700">
              {imageRequests?.map((request, index) => (
                <React.Fragment key={index}>
                  <tr key={index} className="cursor-pointer hover:bg-black/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRequests.has(request.Id)}
                        onChange={(e) =>
                          handleSelectRequest(request.Id, e.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-[#EAFD66] focus:ring-[#EAFD66]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div
                        className="h-20 w-16 relative"
                        onClick={() => openModal(request)}
                      >
                        <Image
                          src={request.doc.imgUrl}
                          alt={request.doc.title ?? "이미지"}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <IdentitySelector
                        index={index}
                        docs={identities}
                        onIdentitySelect={onIdentitySelect}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <CategorySelector
                        index={index}
                        docs={categories}
                        onCategorySelect={onCategorySelect}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleUploadImage(index)}
                          className="group flex items-center text-sm font-medium text-gray-400 hover:text-[#EAFD66] transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1.5 transition-colors duration-200 group-hover:text-[#EAFD66]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          업로드
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest(request.Id);
                          }}
                          className="group flex items-center text-sm font-medium text-gray-400 hover:text-red-400 transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1.5 transition-colors duration-200 group-hover:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* 모달을 테이블 외부로 이동 */}
          {imageRequests?.map((request) => (
            <ImagePreviewModal
              key={request.Id}
              isOpen={openModalId === request.Id}
              onClose={() => setOpenModalId(null)}
              request={{
                imgUrl: request.doc.imgUrl,
                title: request.doc.title,
                description: request.doc.description || "",
                style: request.doc.style || "",
                requestedItems: request.doc.requestedItems,
              }}
            />
          ))}

          {/* 로딩 인디케이터 및 관찰 대상 요소 */}
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

          {imageRequests.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              요청된 이미지가 없습니다.
            </div>
          )}

          {/* 모든 데이터를 불러왔을 때 표시 */}
          {!nextId && imageRequests.length > 0 && !isLoading && (
            <div className="text-center py-4 text-gray-500 text-sm">
              모든 데이터를 불러왔습니다
            </div>
          )}
        </div>
      </div>
      <div className="block sm:hidden">
        <MobileView
          imageRequests={imageRequests}
          categories={categories}
          identities={identities}
          openModalId={openModalId}
          onOpenModal={openModal}
          onIdentitySelect={onIdentitySelect}
          onCategorySelect={onCategorySelect}
          onUploadImage={handleUploadImage}
          onDeleteRequest={handleDeleteRequest}
          onCloseModal={() => setOpenModalId(null)}
        />
      </div>
    </div>
  );
};

export const Header = ({
  isLoading,
  onRefresh,
  handleBulkUpload,
  handleBulkDelete,
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-400">이미지 요청 목록</h2>
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
              새로고침 중...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              새로고침
            </>
          )}
        </button>
        <button
          onClick={() => handleBulkUpload()}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#EAFD66] hover:bg-[#dbed5d] focus:outline-none disabled:bg-gray-400"
        >
          <svg
            className="h-4 w-4 mr-2"
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
          일괄 추가
        </button>
        <button
          onClick={() => handleBulkDelete()}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          일괄 삭제
        </button>
      </div>
    </div>
  );
};

export default ImageRequestSection;
