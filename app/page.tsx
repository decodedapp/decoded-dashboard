"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import AdminLogin from "./components/login/login";
import { networkManager } from "@/network/network";
import { ArtistModal } from "./components/modal/artist";
import { ImagePreviewModal } from "./components/modal/image";
import { AddItemModal } from "./components/modal/add";
import { ProvidePanel } from "./components/modal/provide";
import {
  RequestImage,
  RequestedItem,
  Point,
  ItemDocument,
  ImageDocument,
  Item,
  Position,
} from "@/types/model";
import {
  ItemClass,
  ItemSubClass,
  subClassesByClass,
  categoriesBySubClass,
} from "@/constants/categories";
import { arrayBufferToBase64, convertKeysToCamelCase } from "@/utils/util";

type TabType = "requests" | "images" | "artists" | "brands";

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>("requests");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const tabs = [
    { id: "requests", name: "요청/제공 관리" },
    { id: "images", name: "이미지 요청" },
    { id: "artists", name: "아티스트 요청" },
    { id: "brands", name: "브랜드 요청" },
  ] as const;

  const handleLogin = () => {
    setIsAdmin(true);
  };

  // Checking admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedAdminStatus = localStorage.getItem("isAdmin");
      if (storedAdminStatus === "true") {
        setIsAdmin(true);
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">관리자 로그인</h2>
            <p className="mt-2 text-sm text-gray-600">
              계속하려면 관리자 계정으로 로그인해주세요
            </p>
          </div>

          <AdminLogin onLogin={handleLogin} />

          <div className="text-center text-sm text-gray-500">
            <p>관리자 권한이 필요한 페이지입니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <h1
              className="text-2xl font-bold text-gray-900"
              onClick={() => setIsAdmin(false)}
            >
              관리자 대시보드
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    currentTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {currentTab === "requests" && <RequestProvideSection />}
        {currentTab === "images" && <ImageRequestSection />}
        {currentTab === "artists" && <ArtistRequestSection />}
        {currentTab === "brands" && <BrandRequestSection />}
      </div>
    </div>
  );
}

const RequestProvideSection = () => {
  const [selectedTab, setSelectedTab] = useState("request");
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-2">
          <button
            className={`
          py-4 text-center text-sm font-medium transition-all duration-200
          ${
            selectedTab === "request"
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-50"
          }
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black
        `}
            onClick={() => setSelectedTab("request")}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Request</span>
            </div>
          </button>
          <button
            className={`
          py-4 text-center text-sm font-medium transition-all duration-200
          ${
            selectedTab === "provide"
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-50"
          }
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black
        `}
            onClick={() => setSelectedTab("provide")}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              <span>Provide</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <div
          className={`
      bg-white rounded-lg shadow
      ${selectedTab === "request" ? "block" : "hidden"}
    `}
        >
          <RequestSection />
        </div>
        <div
          className={`
      bg-white rounded-lg shadow
      ${selectedTab === "provide" ? "block" : "hidden"}
    `}
        >
          <ProvideSection />
        </div>
      </div>
    </div>
  );
};

const ImageRequestSection = () => {
  const [imageRequests, setImageRequests] = useState<any[]>([]);
  console.log(imageRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  useEffect(() => {
    fetchImageRequests();
  }, []);

  const handleUploadImage = async (index: number) => {
    const request = imageRequests[index];
    const requestWithArrayStyle = {
      ...request.doc,
      style:
        !request.doc.style || request.doc.style === ""
          ? null
          : [request.doc.style],
    };
    const isNew: boolean = request.isNew;
    if (isNew) {
      const uploadImage = { imageBase: requestWithArrayStyle };
      await networkManager
        .request(`upload/image?id=${request.Id}`, "POST", uploadImage)
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
        imageDocId: request.metadata.imageDocId,
        items: request.doc.requestedItems,
      };
      await networkManager
        .request(`update/items?id=${request.Id}`, "POST", updateItem)
        .then(() => {
          alert("아이템 업데이트 완료");
          fetchImageRequests();
        });
    }
  };

  const getModifiedData = (requestId: string) => {
    const stored = sessionStorage.getItem(`modifiedRequest_${requestId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const fetchImageRequests = async () => {
    setIsLoading(true);
    try {
      const res = await networkManager.request(
        "requests?doc_type=image",
        "GET",
        null
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
      setImageRequests(updatedRequests);
    } catch (error) {
      alert("이미지 요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    const isConfirmed = window.confirm("정말로 이 요청을 삭제하시겠습니까?");

    if (isConfirmed) {
      try {
        await networkManager.request(
          `delete/request?id=${requestId}`,
          "DELETE",
          null
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
      artist: string;
    }
  ) => {
    sessionStorage.setItem(
      `modifiedRequest_${requestId}`,
      JSON.stringify(updatedDoc)
    );
    console.log(updatedDoc);
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
                requestedItems: updatedDoc.requestedItems,
              },
              metadata: {
                ...request.metadata,
                subject: updatedDoc.artist,
              },
            }
          : request
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">이미지 요청 목록</h2>
        <button
          onClick={fetchImageRequests}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이미지
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                아티스트명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                스타일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청 아이템
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {imageRequests?.map((request, index) => (
              <React.Fragment key={index}>
                <tr key={index} className="cursor-pointer hover:bg-gray-50">
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
                    <div className="text-sm text-gray-900">
                      {request.metadata.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.doc.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {request.doc.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.doc.style || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.doc.requestedItems ? (
                        Object.values(request.doc.requestedItems)
                          .flat()
                          .map((item: any, i: number) => (
                            <div key={i} className="mb-1">
                              {item.itemClass} - {item.itemSubClass} -
                              {item.category}
                            </div>
                          ))
                      ) : (
                        <div className="text-gray-500">요청된 아이템 없음</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUploadImage(index)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-white border border-blue-600 hover:bg-blue-600 rounded-md transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
                        onClick={() => setOpenModalId(request.Id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-white border border-green-600 hover:bg-green-600 rounded-md transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(request.Id);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-md transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
              artist: {
                id: Object.keys(request.doc.requestedItems)[0],
                name: request.metadata.subject,
              },
            }}
            onUpdate={(updatedDoc) =>
              handleUpdateRequest(request.Id, updatedDoc)
            }
          />
        ))}

        {imageRequests.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            요청된 이미지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

const ArtistRequestSection = () => {
  const [artistRequests, setArtistRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArtistRequests = async () => {
    console.log("fetching artist requests");
    setIsLoading(true);
    try {
      const res = await networkManager.request(
        "requests?doc_type=artist",
        "GET",
        null
      );
      setArtistRequests(res?.data.requests || []);
    } catch (error) {
      console.error("요청 목록 조회 실패:", error);
      alert("요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistRequests();
  }, []);

  const handleDeleteRequest = async (requestId: string) => {
    const isConfirmed = window.confirm("정말로 이 요청을 삭제하시겠습니까?");

    if (isConfirmed) {
      await networkManager
        .request(`delete/request?id=${requestId}`, "DELETE", null)
        .then(() => {
          setArtistRequests((prevRequests) =>
            prevRequests.filter((request) => request._id !== requestId)
          );
          alert("요청이 삭제되었습니다.");
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.description ||
            "요청 삭제 중 오류가 발생했습니다.";
          console.error("요청 삭제 실패:", errorMessage);
          alert(errorMessage);
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">아티스트 요청 목록</h2>
        <button
          onClick={fetchArtistRequests}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {artistRequests.map((artist, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {artist.doc.name?.ko || "미지정"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {artist.doc.category || "미지정"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(artist.requested_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                  <button
                    onClick={() =>
                      (
                        document.getElementById(
                          `artist_modal_${index}`
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                    className="text-blue-600 hover:text-blue-900"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(artist._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                  <ArtistModal
                    id={index}
                    requestId={artist._id}
                    artistName={artist.doc.name}
                    artistCategory={artist.doc.category}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BrandRequestSection = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold mb-4">브랜드 요청 목록</h2>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                브랜드명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 브랜드 요청 목록 데이터 매핑 */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function RequestSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  // State of navigation
  const [isStepComplete, setIsStepComplete] = useState(false);
  // State of step1
  const [selectedCeleb, setSelectedCeleb] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // State of step2
  const [imageFile, setImageFile] = useState<File | null>(null);
  // State of step3
  const [points, setPoints] = useState<Point[]>([]);
  console.log(points);

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setIsStepComplete(!!selectedCeleb);
        break;
      case 2:
        setIsStepComplete(!!selectedImage);
        break;
      case 3:
        setIsStepComplete(
          points.length > 0 &&
            points.every((point) => point.itemClass && point.category)
        );
        break;
      default:
        setIsStepComplete(false);
    }
  }, [currentStep, selectedCeleb, selectedImage, points]);

  const usePersistedState = <T,>(key: string, initialState: T) => {
    const [state, setState] = useState<T>(() => {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialState;
    });

    useEffect(() => {
      sessionStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState] as const;
  };

  const [context] = usePersistedState("context", "");

  const defaultState = () => {
    setCurrentStep(1);
    setSelectedCeleb(null);
    setSelectedImage(null);
    setImageFile(null);
    setPoints([]);
  };

  const handleSubmit = async () => {
    if (!selectedCeleb || !imageFile) {
      alert("Please select a celebrity and upload an image");
      return;
    }
    const title = `${context}에서의 ${selectedCeleb.name}`;
    const items: RequestedItem[] = [];
    for (const point of points) {
      if (!point.itemClass || !point.itemSubClass || !point.category) {
        alert("Please select an item class, sub class, and category");
        return;
      }
      items.push({
        itemClass: point.itemClass,
        itemSubClass: point.itemSubClass,
        category: point.category,
        position: {
          top: point.y.toString(),
          left: point.x.toString(),
        },
      });
    }
    const requestedItems: Record<string, RequestedItem[]> = {};
    requestedItems[selectedCeleb.id] = items;
    const buffer = await imageFile?.arrayBuffer();
    const base64Image = arrayBufferToBase64(buffer);
    const requestImage: RequestImage = {
      title,
      requestedItems,
      requestBy: sessionStorage.getItem("USER_DOC_ID")!,
      imageFile: base64Image,
      metadata: {
        subject: selectedCeleb.name,
      },
    };
    networkManager
      .request("request/image", "POST", requestImage)
      .then(() => {
        alert("요청이 완료되었습니다.");
        defaultState();
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.description || "요청 중 오류가 발생했습니다.";
        console.error("요청 실패:", errorMessage);
        alert(errorMessage);
      });
  };

  // Next Button Component
  const NextButton = () => (
    <button
      onClick={() => setCurrentStep((prev) => prev + 1)}
      disabled={!isStepComplete}
      className={`
        px-6 py-2 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          isStepComplete
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
      `}
    >
      다음
    </button>
  );

  // Previous Button Component
  const PrevButton = () => (
    <button
      onClick={() => setCurrentStep((prev) => prev - 1)}
      className="px-6 py-2 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
    >
      이전
    </button>
  );

  const StepIndicator = () => (
    <div className="w-full mb-20">
      <div className="relative pt-1">
        <div className="absolute top-5 w-full">
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-yellow-400 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="relative">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  currentStep > index + 1
                    ? "bg-black text-white"
                    : currentStep === index + 1
                    ? "bg-yellow-400"
                    : "bg-gray-200"
                }
              `}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Step1 = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCeleb, setNewCeleb] = useState({
      name: "",
      category: "",
      requestBy: "",
    });
    const [celebs, setCelebs] = useState<
      {
        name: string;
        category: string;
        id: string;
      }[]
    >([]);
    useEffect(() => {
      networkManager.request("artists", "GET", null).then((res) => {
        for (const celeb of res.data.artists) {
          setCelebs((prev) => [
            ...prev,
            { name: celeb.name.ko, category: celeb.category, id: celeb._id },
          ]);
        }
      });
    }, []);

    const onRequestComplete = () => {
      setLoading(false);
      setShowAddForm(false);
      setNewCeleb({ name: "", category: "", requestBy: "" });
    };

    const filteredCelebs =
      celebs.length > 0
        ? celebs.filter((celeb) =>
            celeb.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

    const handleCelebRequest = (celeb: {
      name: string;
      category: string;
      requestBy: string;
    }) => {
      const address = sessionStorage.getItem("USER_DOC_ID");
      if (!celeb.name || celeb.category === "") {
        alert("Please fill in all fields");
        return;
      }
      if (address) {
        celeb.requestBy = address;
        setLoading(true);
        networkManager
          .request("request/artist", "POST", celeb)
          .then(() => {
            alert("요청이 완료되었습니다.");
            onRequestComplete();
          })
          .catch((error) => {
            const errorMessage =
              error.response?.data?.description ||
              "요청중 오류가 발생했습니다.";
            console.error("요청 실패:", errorMessage);
            alert(errorMessage);
            onRequestComplete();
          });
      } else {
        alert("Please login first");
      }
    };

    return (
      <div className="relative min-h-screen space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          어떤 셀럽의 아이템을 찾고 계신가요?
        </h2>

        <div className="max-w-md mx-auto">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="셀럽 이름을 검색해주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Result */}
          {searchQuery && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredCelebs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredCelebs.map((celeb, index) => (
                    <div
                      key={index}
                      className={`p-4 cursor-pointer transition-colors
                        ${
                          selectedCeleb?.name === celeb.name
                            ? "bg-yellow-50"
                            : "hover:bg-gray-50"
                        }`}
                      onClick={() =>
                        setSelectedCeleb({ id: celeb.id, name: celeb.name })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {celeb.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {celeb.category}
                          </p>
                        </div>
                        {selectedCeleb?.name === celeb.name && (
                          <svg
                            className="h-5 w-5 text-yellow-400"
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-500 mb-4">
                    찾으시는 셀럽이 목록에 없나요?
                  </p>
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      셀럽 추가 요청하기
                    </button>
                  ) : (
                    <div className="max-w-md mx-auto p-4 border rounded-lg">
                      <h3 className="font-bold mb-3">셀럽 추가 요청</h3>
                      <input
                        type="text"
                        placeholder="셀럽 이름"
                        className="w-full p-2 border rounded mb-2"
                        value={newCeleb.name}
                        onChange={(e) =>
                          setNewCeleb({ ...newCeleb, name: e.target.value })
                        }
                      />
                      <select
                        className="w-full p-2 border rounded mb-4"
                        value={newCeleb.category}
                        onChange={(e) =>
                          setNewCeleb({ ...newCeleb, category: e.target.value })
                        }
                      >
                        <option value="kpop">K-POP</option>
                        <option value="actor">배우</option>
                        <option value="athlete">운동선수</option>
                      </select>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleCelebRequest(newCeleb)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                          disabled={!newCeleb.name}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            </>
                          ) : (
                            <span>추가 요청하기</span>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        * 요청하신 셀럽 정보는 검토 후 24시간 이내에 반영됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected Celeb Display */}
          {selectedCeleb && !searchQuery && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedCeleb.name}
                  </p>
                  <p className="text-sm text-gray-500">선택됨</p>
                </div>
                <button
                  onClick={() => setSelectedCeleb(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
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
          )}
        </div>
      </div>
    );
  };

  const Step2 = () => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [context, setContext] = usePersistedState("context", "");

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files[0]);
      }
    };

    const handleFiles = (file: File) => {
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file);
      setSelectedImage(fileUrl);
    };

    return (
      <div className="space-y-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">
            {selectedCeleb?.name}의 사진을 업로드해주세요
          </h2>
          <p className="text-gray-500">
            아이템 식별에 도움이 될 만한 선명한 사진을 올려주세요
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {!selectedImage ? (
            <div
              className={`
                relative
                aspect-[3/4]
                rounded-lg
                border-2
                border-dashed
                transition-all
                ${
                  dragActive
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFiles(e.target.files[0]);
                  }
                }}
                accept="image/*"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4">
                  <svg
                    className={`w-12 h-12 mb-3 ${
                      dragActive ? "text-yellow-400" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <p
                  className={`mb-2 text-lg ${
                    dragActive ? "text-yellow-600" : "text-gray-600"
                  }`}
                >
                  {dragActive
                    ? "여기에 놓아주세요!"
                    : "이미지를 드래그하여 업로드하거나"}
                </p>

                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  컴퓨터에서 선택
                </button>

                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, GIF (최대 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Selected preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <svg
                    className="w-5 h-5 text-white"
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

              {/* Context Information Input Section */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    컨텍스트 정보
                  </label>
                  <textarea
                    placeholder="예: 인천공항 출국길, 2024 SS 패션위크, 신곡 뮤직비디오 등"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>모르는 경우 건너뛰기 가능</span>
                  <span className="text-right">{context.length}/200자</span>
                </div>

                {/* Preview of Input Information */}
                {context && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{context}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  업로드 팁
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>선명하고 깨끗한 사진일수록 아이템 식별이 쉬워요</li>
                    <li>가능한 전신 사진을 올려주시면 좋아요</li>
                    <li>컨텍스트 정보는 아이템을 찾는데 큰 도움이 됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Step3 = () => {
    const imageRef = useRef<HTMLDivElement>(null);

    const handleImageClick = (e: React.MouseEvent) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPoints([...points, { x, y }]);
    };

    const removePoint = (index: number) => {
      setPoints(points.filter((_, i) => i !== index));
    };

    const updatePointClass = (index: number, itemClass: ItemClass) => {
      setPoints(
        points.map((point, i) =>
          i === index ? { ...point, itemClass, category: undefined } : point
        )
      );
    };

    const updatePointSubClass = (index: number, itemSubClass: ItemSubClass) => {
      setPoints(
        points.map((point, i) =>
          i === index ? { ...point, itemSubClass, category: undefined } : point
        )
      );
    };

    const updatePointCategory = (index: number, category: string) => {
      setPoints(
        points.map((point, i) => (i === index ? { ...point, category } : point))
      );
    };

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          궁금한 아이템을 선택해주세요
        </h2>

        <div className="max-w-2xl mx-auto space-y-2 text-gray-600">
          <p className="text-sm">
            이미지를 클릭하여 궁금한 아이템의 위치를 표시해주세요
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="font-medium text-gray-900">필수 입력사항</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">아이템 선택</p>
                  <p className="text-gray-600">
                    최소 1개 이상의 아이템을 선택해주세요
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">아이템 종류</p>
                  <p className="text-gray-600">
                    Fashion, Furniture, Art 중 선택
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">상세 카테고리</p>
                  <p className="text-gray-600">
                    선택한 종류에 따른 세부 카테고리 선택
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p className="font-medium">주의사항</p>
            <ul className="mt-1 text-xs space-y-1 list-disc list-inside">
              <li>최소 1개 이상의 아이템을 선택해야 합니다</li>
              <li>
                모든 선택한 아이템에 대해 종류와 카테고리를 지정해야 합니다
              </li>
              <li>위 조건이 모두 충족되어야 다음 단계로 진행할 수 있습니다</li>
            </ul>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {selectedImage && (
            <div
              ref={imageRef}
              className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-crosshair"
              onClick={handleImageClick}
            >
              <Image
                src={selectedImage}
                alt="Selected preview"
                fill
                className="object-cover"
              />

              {points.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-6 h-6 -ml-3 -mt-3 group"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <div className="relative">
                    <div className="absolute w-6 h-6 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
                    <div
                      className={`
                      relative w-6 h-6 rounded-full flex items-center justify-center
                      ${
                        point.itemClass && point.category
                          ? "bg-green-400"
                          : "bg-yellow-400"
                      }
                    `}
                    >
                      <span className="text-xs text-white font-bold">
                        {index + 1}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePoint(index);
                      }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white 
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Point List */}
          {points.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-gray-900">선택한 아이템</h3>
              <div className="space-y-4">
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`
                          w-5 h-5 rounded-full flex items-center justify-center
                          ${
                            point.itemClass && point.category
                              ? "bg-green-400"
                              : "bg-yellow-400"
                          }
                        `}
                        >
                          <span className="text-xs text-white font-bold">
                            {index + 1}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          아이템 {index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removePoint(index)}
                        className="text-gray-400 hover:text-red-500"
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
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Class Selection */}
                    <div className="flex gap-2">
                      {(["Fashion", "Furniture", "Art"] as ItemClass[]).map(
                        (itemClass) => (
                          <button
                            key={itemClass}
                            onClick={() => updatePointClass(index, itemClass)}
                            className={`
                            px-3 py-1.5 rounded-full text-sm
                            ${
                              point.itemClass === itemClass
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }
                          `}
                          >
                            {itemClass}
                          </button>
                        )
                      )}
                    </div>

                    {/* Sub Class Selection */}
                    {point.itemClass && (
                      <div className="flex gap-2 flex-wrap">
                        {subClassesByClass[point.itemClass].map((subClass) => (
                          <button
                            key={subClass}
                            onClick={() => updatePointSubClass(index, subClass)}
                            className={`
                              px-3 py-1.5 rounded-full text-sm
                              ${
                                point.itemSubClass === subClass
                                  ? "bg-yellow-400 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }
                            `}
                          >
                            {subClass}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category Selection */}
                    {point.itemSubClass && (
                      <div className="flex gap-2 flex-wrap">
                        {categoriesBySubClass[point.itemSubClass].map(
                          (category) => (
                            <button
                              key={category}
                              onClick={() =>
                                updatePointCategory(index, category)
                              }
                              className={`
                              px-3 py-1.5 rounded-full text-sm
                              ${
                                point.category === category
                                  ? "bg-green-400 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }
                            `}
                            >
                              {category}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {points.length === 0 && (
            <div className="mt-6 text-center text-gray-500">
              이미지를 클릭하여 궁금한 아이템을 선택해주세요
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <StepIndicator />
        <div className="mt-8">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between">
          <div>{currentStep > 1 && <PrevButton />}</div>
          <div>
            {currentStep < totalSteps && <NextButton />}
            {currentStep === totalSteps && (
              <button
                onClick={handleSubmit}
                disabled={!isStepComplete}
                className={`
                  px-6 py-2 rounded-md text-sm font-medium
                  transition-all duration-200
                  ${
                    isStepComplete
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DecodingProgress = ({ progress }: { progress: number }) => {
  const totalBlocks = 20;
  const filledBlocks = Math.floor((progress / 100) * totalBlocks);

  return (
    <div className="mt-8 bg-[#1A1A1A] rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-mono text-sm tracking-wider text-emerald-500">
          DECODING..
        </div>
        <div className="font-mono text-sm text-emerald-500">{progress}%</div>
      </div>

      {/* 프로그레스 바 - 더 뚜렷한 펄스 효과 */}
      <div className="flex gap-1 mb-4">
        {[...Array(totalBlocks)].map((_, index) => (
          <div
            key={index}
            className={`
              h-4 flex-1 transition-all duration-300
              ${
                index < filledBlocks
                  ? "bg-emerald-500 animate-progress-pulse"
                  : "bg-zinc-700"
              }
            `}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">아이템 정보 요청</div>
    </div>
  );
};

function ProvideSection() {
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageDocument | null>(
    null
  );
  const [saleUrl, setSaleUrl] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    imageId: string;
    artistId: string;
    itemIndex: number;
    item: Item;
  } | null>(null);

  const [newItemPosition, setNewItemPosition] = useState<Position | null>(null);
  const [modalOpenIndex, setModalOpenIndex] = useState<number | null>(null);

  const handleImageClick = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
  };

  const handleCloseModal = () => {
    setModalOpenIndex(null);
  };

  const handleAddItems = (positions: Position[]) => {
    // TODO: API 호출하여 새 아이템들 추가
    console.log("Adding new items:", positions);
  };

  // 제공 버튼 클릭 핸들러
  const handleProvideClick = (
    imageId: string,
    artistId: string,
    itemIndex: number,
    item: Item
  ) => {
    setSelectedItem({ imageId, artistId, itemIndex, item });
    setIsOpen(true);
  };

  const calculateDecodingProgress = (items: Record<string, Item[]>) => {
    // 모든 아이템을 하나의 배열로 합치기
    const allItems = Object.values(items).flat();
    console.log(allItems);
    const totalItems = allItems.length;

    if (totalItems === 0) return 0;

    // isDecoded가 true인 아이템 개수 세기
    const decodedItems = allItems.filter((item) => item.isDecoded).length;

    // 퍼센트 계산 (소수점 반올림)
    return Math.round((decodedItems / totalItems) * 100);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await networkManager.request(
        "images/decoding",
        "GET",
        null
      );
      const images = convertKeysToCamelCase(response.data.images);
      console.log(images);
      setImages(images);
    } catch (error) {
      console.error("이미지 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvideInfo = async () => {
    if (!selectedItem || !saleUrl) return;

    try {
      await networkManager.request(
        `provide/item?image_id=${selectedItem.imageId}&artist_id=${selectedItem.artistId}&item_index=${selectedItem.itemIndex}`,
        "POST",
        { sale_url: saleUrl }
      );
      alert("정보 제공이 완료되었습니다.");
      setSaleUrl("");
      setSelectedItem(null);
      fetchImages(); // 목록 새로고침
    } catch (error) {
      console.error("정보 제공 실패:", error);
      alert("정보 제공에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] text-white">
      {/* 상단 네비게이션 바 */}
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">FASHION</h1>
            <div className="flex gap-6">
              <button className="text-white hover:text-blue-400 transition-colors">
                ALL
              </button>
              <button className="text-gray-400 hover:text-blue-400 transition-colors">
                FASHION
              </button>
              <button className="text-gray-400 hover:text-blue-400 transition-colors">
                INTERIOR
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 컨텐츠 컨테이너 */}
      <div className="relative w-full overflow-hidden">
        {/* 메인 페이지 */}
        <div
          className={`transform transition-transform duration-300 ${
            isOpen ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {/* 메인 컨텐츠 */}
          <div className="max-w-[1400px] mx-auto p-6">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row gap-8 mb-12"
                onClick={(e) => handleImageClick(index, e)}
              >
                {/* 왼쪽: 이미지 섹션 */}
                <div className="lg:w-[600px]">
                  <div className="relative w-full aspect-[3/4] group">
                    {/* 아이템 추가 버튼 수정 */}
                    <button
                      onClick={() =>
                        (
                          document.getElementById(
                            `add_item_modal_${index}`
                          ) as HTMLDialogElement
                        )?.showModal()
                      }
                      className={`
                    absolute top-4 right-4 z-10
                    inline-flex items-center px-4 py-2 
                    bg-gray-800 text-white rounded-md
                    hover:bg-gray-700 transition-colors
                  `}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      아이템 추가
                    </button>
                    {/* 아이템 추가 모달 */}
                    <AddItemModal id={index} image={image} />
                    <Image
                      src={image.imgUrl}
                      alt="Fashion item"
                      fill
                      className="object-cover rounded-lg"
                    />
                    {/* 마커 애니메이션 효과 추가 */}
                    {Object.values(image.items)
                      .flat()
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                          style={{
                            top: `${item.position.top}%`,
                            left: `${item.position.left}%`,
                          }}
                        >
                          {/* 외부 링 애니메이션 */}
                          <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping"></div>

                          {/* 내부 마커 */}
                          <div className="relative w-full h-full">
                            {/* 외부 원 */}
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full border-2 border-white/50"></div>
                            {/* 내부 원 */}
                            <div className="absolute inset-[4px] bg-white rounded-full shadow-lg"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 오른쪽: 아이템 목록 섹션 */}
                <div className="lg:flex-1 lg:max-w-full space-y-4 flex flex-col justify-between">
                  {Object.entries(image.items).map(([artistId, items], idx) => (
                    <div key={idx} className="space-y-3">
                      {items.map((itemDoc, index) => {
                        const isRequestedStatus = !itemDoc.isDecoded;

                        return (
                          <div
                            key={index}
                            className="group flex items-center gap-4 bg-[#1A1A1A] p-4 hover:bg-[#222222] transition-colors border border-zinc-800"
                          >
                            {/* 아이템 이미지 (placeholder) */}
                            <div className="w-16 h-16 bg-white/[0.5] rounded flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-zinc-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>

                            {/* 아이템 정보 */}
                            <div className="flex-1 min-w-0">
                              {/* 카테고리 (소문자로 표시) */}
                              <div className="text-sm text-zinc-400 uppercase tracking-wide font-medium">
                                {itemDoc.item.category}
                              </div>

                              {/* 브랜드명 (placeholder) */}
                              <div className="text-lg font-medium text-white mt-1">
                                {itemDoc.item.name?.value || (
                                  <div className="h-6 w-32 bg-white/[0.5] rounded animate-pulse"></div>
                                )}
                              </div>

                              {/* 아이템명 (placeholder) */}
                              <div className="text-sm text-zinc-300 mt-0.5">
                                {itemDoc.item.name?.value || (
                                  <div className="h-4 w-48 bg-white/[0.5] rounded animate-pulse"></div>
                                )}
                              </div>
                            </div>

                            {/* 포인트와 제공 버튼 */}
                            <div className="flex items-center gap-3">
                              {/* 포인트 표시 */}
                              <div className="flex items-center gap-2 bg-white/[0.08] px-3 py-2 rounded">
                                <svg
                                  className="w-5 h-5 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.7 10.7l2.3-2.3V14a1 1 0 102 0V8.4l2.3 2.3a1 1 0 001.4-1.4l-4-4a1 1 0 00-1.4 0l-4 4a1 1 0 001.4 1.4z" />
                                </svg>
                                <span className="text-base font-medium text-white">
                                  10
                                </span>
                              </div>

                              {/* 제공 버튼 */}
                              {isRequestedStatus && (
                                <button
                                  onClick={() =>
                                    handleProvideClick(
                                      image.docId,
                                      artistId,
                                      index,
                                      itemDoc
                                    )
                                  }
                                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium 
                 text-base transition-colors shadow-lg shadow-blue-500/20"
                                >
                                  제공
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Decoding Progress Bar */}
                  <DecodingProgress
                    progress={calculateDecodingProgress(image.items)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 제공 페이지 */}
        <div
          className={`absolute top-0 left-0 w-full min-h-screen transform transition-transform duration-300 bg-[#111111] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedItem && (
            <div className="max-w-[1400px] mx-auto p-6">
              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => setIsOpen(false)}
                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                돌아가기
              </button>

              {/* 제공 폼 컨텐츠 */}
              <div className="h-full overflow-y-auto">
                <ProvidePanel
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  item={selectedItem?.item.item!}
                  // onSubmit={handleProvideSubmit}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
