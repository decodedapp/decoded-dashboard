import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { networkManager } from "@/network/network";
import { convertKeysToCamelCase } from "@/utils/util";
import { ImagePreviewModal } from "./modal/image";
import { RequestedItem } from "@/types/model";

const ImageRequestSection = () => {
  const [imageRequests, setImageRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [nextId, setNextId] = useState(null);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchImageRequests();
  }, []);

  const handleUploadImage = async (index: number) => {
    const request = imageRequests[index];
    console.log(request);
    const requestWithArrayStyle = {
      ...request.doc,
      style:
        !request.doc.style || request.doc.style === ""
          ? null
          : [request.doc.style],
    };
    const isNew: boolean = request.metadata.isNew;
    if (isNew) {
      const uploadImage = {
        imageBase: requestWithArrayStyle,
        itemsWithIdentity: request.itemsWithIdentity,
      };
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }
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
        items: request.itemsWithIdentity,
      };
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      await networkManager
        .request(
          `admin/${userDocId}/image/${request.metadata.imageDocId}/add`,
          "POST",
          updateItem
        )
        .then(() => {
          alert("아이템 업데이트 완료");
          fetchImageRequests();
        });
    }
    sessionStorage.removeItem(`modifiedRequest_${request.Id}`);
  };

  const getModifiedData = (requestId: string) => {
    const stored = sessionStorage.getItem(`modifiedRequest_${requestId}`);
    return stored ? JSON.parse(stored) : null;
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
      const updatedRequests = requests.map((request: any) => {
        const modifiedData = getModifiedData(request.Id);
        if (modifiedData) {
          return {
            ...request,
            doc: { ...request.doc, ...modifiedData },
          };
        }
        return request;
      });

      setImageRequests((prev) =>
        cursor ? [...prev, ...updatedRequests] : updatedRequests
      );
      setNextId(res.data.next_id);
    } catch (error) {
      alert("이미지 요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchImageRequests();
  }, []);

  // 스크롤 감지시 추가 데이터 로드
  useEffect(() => {
    if (inView && nextId && !isLoading) {
      fetchImageRequests(nextId);
    }
  }, [inView, nextId, isLoading]);

  const handleDeleteRequest = async (requestId: string) => {
    const isConfirmed = window.confirm("정말로 이 요청을 삭제하시겠습니까?");

    if (isConfirmed) {
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
    }
  };

  const handleUpdateRequest = (
    requestId: string,
    updatedDoc: {
      title: string;
      description: string;
      style: string;
      requestedItems: Record<string, RequestedItem[]>;
    }
  ) => {
    sessionStorage.setItem(
      `modifiedRequest_${requestId}`,
      JSON.stringify(updatedDoc)
    );
    setImageRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.Id === requestId
          ? {
              ...request,
              doc: {
                ...request.doc,
                title: updatedDoc.title,
                description: updatedDoc.description,
                style: updatedDoc.style,
              },
              itemsWithIdentity: updatedDoc.requestedItems,
              metadata: {
                ...request.metadata,
              },
            }
          : request
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-400">
          이미지 요청 목록
        </h2>
        <button
          onClick={() => fetchImageRequests()}
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
      </div>

      <div className="bg-[#222222] shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이미지
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
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
                    <div className="h-20 w-16 relative">
                      <Image
                        src={request.doc.imgUrl}
                        alt={request.doc.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </div>
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
                      <div className="w-px h-4 bg-gray-700" /> {/* 구분선 */}
                      <button
                        onClick={() => setOpenModalId(request.Id)}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        수정
                      </button>
                      <div className="w-px h-4 bg-gray-700" /> {/* 구분선 */}
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

        {imageRequests?.map((request, index) => (
          <ImagePreviewModal
            key={`modal-${index}`}
            isOpen={openModalId === request.Id}
            onClose={() => setOpenModalId(null)}
            request={{
              imgUrl: request.doc.imgUrl,
              title: request.doc.title,
              description: request.doc.description || "",
              style: request.doc.style || "",
              requestedItems: request.doc.requestedItems,
            }}
            onUpdate={(updatedDoc) =>
              handleUpdateRequest(request.Id, updatedDoc)
            }
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
  );
};

export default ImageRequestSection;
