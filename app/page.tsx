"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import AdminLogin from "./components/login/login";
import { networkManager } from "@/network/network";
import { IdentityModal } from "./components/modal/identity";
import { ImagePreviewModal } from "./components/modal/image";
import { BrandModal } from "./components/modal/brand";
import { AddItemModal } from "./components/modal/add";
import { ProvidePanel } from "./components/modal/provide";
import {
  RequestImage,
  RequestedItem,
  Point,
  ImageDocument,
  Item,
  ProvideItemInfoWithMetadata,
  ConfirmItemInfo,
  AdditionalMetadata,
  HasFields,
} from "@/types/model";
import {
  arrayBufferToBase64,
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
} from "@/utils/util";

type TabType = "requests" | "images" | "artists" | "brands" | "confirm";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("requests");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const tabs = [
    { id: "requests", name: "디코디드 프로세스" },
    { id: "images", name: "이미지 요청" },
    { id: "artists", name: "아티스트 요청" },
    { id: "brands", name: "브랜드 요청" },
    { id: "confirm", name: "아이템 확정" },
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
      <div className="h-[50vh]">
        <div className="max-w-md w-full space-y-8 p-6 bg-[#070707] rounded-lg shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-400">관리자 로그인</h2>
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
    <div className="[h-50vh] bg-[#070707]">
      {/* Header */}
      <div className="bg-[#070707]] shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <h1
              className="text-2xl font-bold text-gray-400"
              onClick={() => setIsAdmin(false)}
            >
              관리자 대시보드
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-4 border-b border-gray-800">
        <nav className="-mb-px flex space-x-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    currentTab === tab.id
                      ? "border-[#EAFD66] text-[#EAFD66]"
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
        {currentTab === "confirm" && <ConfirmSection />}
      </div>
    </div>
  );
};

const RequestProvideSection = () => {
  const [selectedTab, setSelectedTab] = useState("request");
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="bg-[#222222] rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-2">
          <button
            className={`
          py-4 text-center text-sm font-medium transition-all duration-200
          ${
            selectedTab === "request"
              ? "bg-[#1A1A1A] text-gray-400"
              : "text-gray-400 hover:bg-black/50"
          }
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
              ? "bg-[#181818] text-gray-400"
              : "text-gray-400 hover:bg-black/50"
          }
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
      bg-[#131313] rounded-lg shadow
      ${selectedTab === "request" ? "block" : "hidden"}
    `}
        >
          <RequestSection />
        </div>
        <div
          className={`
      bg-[#131313] rounded-lg shadow
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
  console.log("ImageRequests", imageRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  useEffect(() => {
    fetchImageRequests();
  }, []);

  const handleUploadImage = async (index: number) => {
    const request = imageRequests[index];
    console.log("request", request);
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
      console.log("uploadImage", uploadImage);
      await networkManager
        .request(`image/upload/${request.Id}`, "POST", uploadImage)
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
      console.log("updateItem", updateItem);
      await networkManager
        .request(
          `image/${request.metadata.imageDocId}/update/items`,
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
      console.log("updatedRequests", updatedRequests);
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
          onClick={fetchImageRequests}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUploadImage(index)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#EAFD66] hover:text-white border border-[#EAFD66] hover:bg-[#EAFD66] rounded-md transition-colors duration-200"
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
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#EAFD66] hover:text-white border border-[#EAFD66] hover:bg-[#EAFD66] rounded-md transition-colors duration-200"
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
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-400 hover:bg-gray-400 rounded-md transition-colors duration-200"
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
    console.log("fetching identity requests");
    setIsLoading(true);
    try {
      const res = await networkManager.request(
        "requests?doc_type=identity",
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
        <h2 className="text-lg font-semibold text-gray-400">
          아티스트 요청 목록
        </h2>
        <button
          onClick={fetchArtistRequests}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
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
                이름
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
            {artistRequests.map((artist, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {artist.doc.name?.ko || "미지정"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(artist.requested_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-2 items-center">
                  <button
                    onClick={() =>
                      (
                        document.getElementById(
                          `identity_modal_${index}`
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                    className="text-[#EAFD66]"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(artist._id)}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    삭제
                  </button>
                  <IdentityModal
                    id={index}
                    requestId={artist._id}
                    identityName={artist.doc.name}
                    onUpdate={fetchArtistRequests}
                    identityCategory={artist.doc.category}
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
  const [brandRequests, setBrandRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataAdded, setIsDataAdded] = useState(false);

  const fetchBrandRequests = async () => {
    setIsLoading(true);
    try {
      const res = await networkManager.request(
        "requests?doc_type=brand",
        "GET",
        null
      );
      setBrandRequests(res?.data.requests || []);
    } catch (error) {
      console.error("요청 목록 조회 실패:", error);
      alert("요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandRequests();
  }, [isDataAdded]);

  const handleDelete = async (requestId: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await networkManager.request(
          `delete/request?id=${requestId}`,
          "DELETE",
          null
        );
        alert("삭제되었습니다.");
        fetchBrandRequests();
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-400">
        브랜드 요청 목록
      </h2>
      <div className="bg-[#1A1A1A] shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                브랜드명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                요청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#222222] divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                </td>
              </tr>
            ) : brandRequests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  요청된 브랜드가 없습니다.
                </td>
              </tr>
            ) : (
              brandRequests.map((request, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {request.doc.name.ko || request.doc.name.en || "이름 없음"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(request.requested_at).toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </td>
                  <td className="flex px-6 py-4 whitespace-nowrap text-sm text-gray-400 items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const modal = document.getElementById(
                            `brand_modal_${index}`
                          ) as HTMLDialogElement;
                          if (modal) modal.showModal();
                        }}
                        className="text-[#EAFD66] hover:text-[#EAFD66]"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="text-gray-500 hover:text-gray-400"
                      >
                        삭제
                      </button>
                    </div>
                    <BrandModal
                      id={index}
                      requestId={request._id}
                      onClose={() => {
                        (
                          document.getElementById(
                            `brand_modal_${index}`
                          ) as HTMLDialogElement
                        )?.close();
                        fetchBrandRequests();
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RequestSection = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  // State of navigation
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // State of step2
  const [imageFile, setImageFile] = useState<File | null>(null);
  // State of step3
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setIsStepComplete(!!selectedImage);
        break;
      case 2:
        setIsStepComplete(points.length > 0);
        break;
      default:
        setIsStepComplete(false);
    }
  }, [currentStep, selectedImage, points]);

  const defaultState = () => {
    setCurrentStep(1);
    setSelectedImage(null);
    setImageFile(null);
    setPoints([]);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("Please select a celebrity and upload an image");
      return;
    }
    const items: RequestedItem[] = [];
    for (const point of points) {
      items.push({
        position: {
          top: point.y.toString(),
          left: point.x.toString(),
        },
        context: point.context,
      });
    }
    const buffer = await imageFile?.arrayBuffer();
    const base64Image = arrayBufferToBase64(buffer);
    const requestImage: RequestImage = {
      requestedItems: items,
      requestBy: sessionStorage.getItem("USER_DOC_ID")!,
      imageFile: base64Image,
      metadata: {},
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
            ? "bg-[#1A1A1A] text-gray-400 hover:bg-black/50"
            : "bg-[#1A1A1A] text-gray-400 cursor-not-allowed"
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
      className="px-6 py-2 rounded-md text-sm font-medium text-gray-400 bg-[#1A1A1A] hover:bg-black/50"
    >
      이전
    </button>
  );

  const StepIndicator = () => (
    <div className="w-full mb-20">
      <div className="relative pt-1">
        {/* 프로그레스 바 컨테이너 - 너비 제한 */}
        <div className="max-w-[120px] mx-auto relative">
          {/* 프로그레스 바 */}
          <div className="absolute top-[11px] w-full">
            <div className="h-[2px] bg-[#070707]">
              <div
                className="h-[2px] bg-[#EAFD66] transition-all duration-500 relative"
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 스텝 마커들 */}
          <div className="flex items-center justify-between">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="relative">
                {/* 현재 스텝의 링 애니메이션 */}
                {currentStep === index + 1 && (
                  <>
                    <div className="absolute -inset-1 rounded-full border-2 border-[#EAFD66]/30 animate-ping" />
                    <div className="absolute -inset-1 rounded-full border-2 border-[#EAFD66]/30" />
                  </>
                )}

                {/* 스텝 마커 */}
                <div
                  className={`
                    w-5 h-5 rounded-full 
                    ${
                      index + 1 < currentStep
                        ? "bg-[#EAFD66]" // 완료된 스텝
                        : index + 1 === currentStep
                        ? "bg-[#EAFD66]" // 현재 스텝
                        : "border-[2.5px] border-[#333333] bg-transparent" // 미완료 스텝
                    }
                  `}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Step1 = () => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
          <h2 className="text-3xl font-bold mb-2 text-gray-400">
            사진을 업로드해주세요
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
                border-gray-700
                transition-all
                ${
                  dragActive
                    ? "border-yellow-400 bg-[#1A1A1A]"
                    : "border-gray-700 bg-[#1A1A1A]"
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

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#1A1A1A]">
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
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-700 rounded-lg hover:bg-gray-100"
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
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#1A1A1A] rounded-lg p-4">
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

  const Step2 = () => {
    const imageRef = useRef<HTMLDivElement>(null);

    const handleImageClick = (e: React.MouseEvent) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPoints([...points, { x, y }]);
    };

    const updatePointContext = (index: number, context: string) => {
      setPoints(
        points.map((point, i) => (i === index ? { ...point, context } : point))
      );
    };

    const removePoint = (index: number) => {
      setPoints(points.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-400 text-center mb-8">
          궁금한 아이템을 선택해주세요
        </h2>

        <div className="max-w-2xl mx-auto space-y-2 text-gray-600">
          <p className="text-sm">
            이미지를 클릭하여 궁금한 아이템의 위치를 표시해주세요
          </p>
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <p className="font-medium text-gray-400">필수 입력사항</p>
            <div className="mt-2 flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-400">아이템 선택</p>
                <p className="text-gray-600 text-sm">
                  최소 1개 이상의 아이템을 선택해주세요
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-3 text-sm text-gray-400">
            <p className="font-medium">주의사항</p>
            <ul className="mt-1 text-xs space-y-1 list-disc list-inside">
              <li>최소 1개 이상의 아이템을 선택해야 합니다</li>
              <li>
                선택한 위치를 삭제하려면 마커에 마우스를 올린 후 X 버튼을
                클릭하세요
              </li>
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
                    <div className="absolute w-4 h-4 animate-ping rounded-full bg-[#EAFD66] opacity-75"></div>
                    <div className="relative w-4 h-4 rounded-full bg-[#EAFD66] flex items-center justify-center">
                      <span className="text-xs text-black font-bold">
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
              <div className="space-y-3">
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1A1A] rounded-lg overflow-hidden"
                  >
                    {/* 헤더 부분 */}
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 rounded-full bg-[#EAFD66] flex items-center justify-center">
                          <span className="text-xs text-black font-bold rounded-full p-1">
                            {index + 1}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() => removePoint(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
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

                    {/* 컨텍스트 입력 영역 */}
                    <div className="p-3">
                      <textarea
                        rows={2}
                        value={point.context || ""}
                        onChange={(e) =>
                          updatePointContext(index, e.target.value)
                        }
                        className="w-full text-sm p-2 rounded-md bg-[#1A1A1A] text-gray-400"
                        placeholder="이 아이템에 대한 추가 정보를 입력해주세요 (선택사항)"
                      />
                    </div>
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
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-700 shadow-lg">
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
                      ? "bg-[#1A1A1A] text-[#EAFD66] hover:bg-black/50"
                      : "bg-[#1A1A1A] text-gray-400 cursor-not-allowed"
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
};

const ProvideSection = () => {
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{
    imageId: string;
    artistId: string;
    itemIndex: number;
    item: Item;
  } | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await networkManager.request("images", "GET", null);
      const images = convertKeysToCamelCase(response.data.images);
      setImages(images);
      console.log(images);
    } catch (error) {
      console.error("이미지 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabKey: string, itemClass: string) => {
    setActiveTabs((prev) => ({
      ...prev,
      [tabKey]: itemClass,
    }));
  };

  const handleProvideClick = (
    imageId: string,
    artistId: string,
    itemIndex: number,
    item: Item
  ) => {
    setSelectedItem({ imageId, artistId, itemIndex, item });
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
      <div className="relative w-full overflow-hidden">
        {/* 메인 컨텐츠 */}
        <div className="max-w-[1400px] mx-auto p-6">
          {images.map((image, index) => (
            <div key={index} className="flex relative">
              {/* 왼쪽: 이미지 섹션 */}
              <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="lg:w-[600px] lg:sticky lg:top-6 h-fit">
                  <div className="relative w-full aspect-[3/4] group">
                    {/* 아이템 추가 버튼 */}
                    <button
                      onClick={() =>
                        (
                          document.getElementById(
                            `add_item_modal_${index}`
                          ) as HTMLDialogElement
                        )?.showModal()
                      }
                      className="absolute top-4 right-4 z-10 inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
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
                    <AddItemModal id={index} image={image} />
                    <Image
                      src={image.imgUrl}
                      alt="Fashion item"
                      fill
                      className="object-cover rounded-lg"
                    />
                    {/* 마커 애니메이션 */}
                    {Object.values(image.items)
                      .flat()
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{
                            top: `${item.position.top}%`,
                            left: `${item.position.left}%`,
                            zIndex: 10,
                          }}
                        >
                          {/* 브랜드 배지 */}
                          {item.item.brandLogoImageUrl && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20">
                              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg h-6 px-2.5">
                                <div className="flex justify-center items-center gap-1.5">
                                  <img
                                    src={item.item.brandLogoImageUrl}
                                    alt={item.item.brandName || "Brand logo"}
                                    className="w-3 h-3 object-contain rounded-full"
                                  />
                                  <span className="text-xs font-medium text-black whitespace-nowrap">
                                    {item.item.brandName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 마커 */}
                          <div className="w-6 h-6 cursor-pointer">
                            <div className="absolute inset-0 border-2 border-gray-700 rounded-full animate-ping"></div>
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-full border-2 border-gray-700/50"></div>
                              <div className="absolute inset-[4px] bg-white rounded-full shadow-lg"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 아이템 목록 & ProvidePanel 컨테이너 */}
              <div className="flex-1 relative overflow-hidden px-4">
                {/* 아이템 목록 */}
                <div
                  className={`
    w-full transition-transform duration-300 ease-in-out
    ${selectedItem ? "-translate-x-full" : "translate-x-0"}
  `}
                >
                  {Object.entries(image.items).map(([artistId, items]) => {
                    // 아이템을 itemClass별로 그룹화
                    const groupedItems = items.reduce((acc, item) => {
                      const itemClass =
                        item.item.item.metadata.itemClass || "기타";
                      if (!acc[itemClass]) {
                        acc[itemClass] = [];
                      }
                      acc[itemClass].push(item);
                      return acc;
                    }, {} as Record<string, typeof items>);

                    const tabKey = `${artistId}-tab`;
                    const currentTab =
                      activeTabs[tabKey] || Object.keys(groupedItems)[0] || "";

                    return (
                      <div key={artistId} className="space-y-6">
                        {/* 탭 네비게이션 */}
                        <div className="border-b border-zinc-800">
                          <nav
                            className="-mb-px flex space-x-8"
                            aria-label="Tabs"
                          >
                            {Object.entries(groupedItems).map(
                              ([itemClass, items]) => (
                                <button
                                  key={itemClass}
                                  onClick={() =>
                                    handleTabChange(tabKey, itemClass)
                                  }
                                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      currentTab === itemClass
                        ? "border-[#EAFD66] text-[#EAFD66]"
                        : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300"
                    }
                  `}
                                >
                                  {itemClass.toUpperCase()}
                                  <span
                                    className={`ml-2 py-0.5 px-2 rounded-full text-xs
                      ${
                        currentTab === itemClass
                          ? "bg-[#EAFD66] text-black"
                          : "bg-zinc-800 text-zinc-400"
                      }
                    `}
                                  >
                                    {items.length}
                                  </span>
                                </button>
                              )
                            )}
                          </nav>
                        </div>

                        {/* 아이템 리스트 */}
                        <div className="space-y-3">
                          {groupedItems[currentTab]?.map((itemDoc, index) => (
                            <div
                              key={index}
                              className="group flex items-center gap-4 bg-[#1A1A1A] p-4 hover:bg-[#222222] transition-colors border border-zinc-800 rounded-lg"
                            >
                              {/* 아이템 이미지 */}
                              <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden">
                                {itemDoc.item.item.imgUrl ? (
                                  <img
                                    src={itemDoc.item.item.imgUrl}
                                    alt="아이템 이미지"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-[#1A1A1A]/[0.5] flex items-center justify-center">
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
                                )}
                              </div>

                              {/* 아이템 정보 */}
                              <div className="flex-1 min-w-0">
                                {/* 서브 카테고리 */}
                                <div className="text-xs text-zinc-400 uppercase tracking-wide mt-0.5">
                                  {itemDoc.item.item.metadata.itemSubClass}
                                </div>
                                {/* 메인 카테고리 정보 */}
                                <div className="text-sm font-medium text-[#EAFD66]">
                                  {itemDoc.item.item.metadata.category?.toUpperCase() ||
                                    itemDoc.item.item.metadata.subCategory?.toUpperCase() ||
                                    itemDoc.item.item.metadata.productType?.toUpperCase() ||
                                    "UNKNOWN"}
                                </div>
                              </div>

                              {/* 제공 버튼 */}
                              <button
                                onClick={() =>
                                  handleProvideClick(
                                    image.docId,
                                    artistId,
                                    index,
                                    itemDoc
                                  )
                                }
                                className="px-4 py-2 text-zinc-400 hover:text-white rounded-lg font-medium text-base transition-colors hover:bg-zinc-800"
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
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ProvidePanel 슬라이드 */}
                <div
                  className={`
    absolute top-0 left-full w-full h-full
    transition-transform duration-300 ease-in-out
    ${selectedItem ? "-translate-x-full" : "translate-x-0"}
  `}
                >
                  {selectedItem && (
                    <div className="h-full bg-[#111111]">
                      <ProvidePanel
                        isOpen={!!selectedItem}
                        onClose={() => setSelectedItem(null)}
                        imageDocId={selectedItem.imageId}
                        item={selectedItem.item.item.item!}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
  console.log(confirmItemInfo);
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
      };

      console.log("New Request =>", newRequest);

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

  const fetchUnconfirmedItems = async () => {
    try {
      setSelectedItems(new Set());
      setConfirmItemInfo(null);
      const response = await networkManager.request(
        `admin/${sessionStorage.getItem("USER_DOC_ID")}/items/providable`,
        "GET",
        null
      );
      setLabels(response.data.labels);
      const convertedData = response.data.items.map((item: any) => {
        return convertKeysToCamelCase(item);
      });
      setItems(convertedData);
      console.log(convertedData);
      convertedData.forEach((item: any) => {
        setHasFields((prev) => ({
          ...prev,
          [item.itemDocId]: item.hasFields,
        }));
      });
      console.log(hasFields);
    } catch (error) {
      console.error("아이템 정보를 불러오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnconfirmedItems();
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
    try {
      await networkManager.request(
        `item/${itemDocId}/confirm`,
        "POST",
        converted
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

  const handleImageUpload = async (file: File, itemDocId: string) => {
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

  const handLabelSelect = (link: string, label: string) => {
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
                        handleImageUpload(file, item.itemDocId);
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
                                  handLabelSelect(link, e.target.value)
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
                  hasFields={hasFields[item.itemDocId]}
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
                    console.log("Additional Fields", confirmItemInfo);
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

const AdditionalFieldsForm = ({
  hasFields,
  onUpdate,
}: {
  hasFields: HasFields;
  onUpdate: (fields: AdditionalMetadata) => void;
}) => {
  const [fields, setFields] = useState<AdditionalMetadata>({});
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandRequest, setShowBrandRequest] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState<
    { name: { ko: string; en: string }; docId: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<
    { name: { ko: string; en: string }; docId: string }[]
  >([]);
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await networkManager.request("brand/all", "GET", null);
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

    fetchBrands();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFields = { ...fields, [name]: value };
    if (value === "") {
      delete updatedFields[name as keyof AdditionalMetadata];
    }
    setFields(updatedFields);
    onUpdate(updatedFields);
  };

  const handleBrandSearch = (query: string) => {
    setBrandQuery(query);
    if (query.length > 0) {
      const filtered = brands.filter(
        (brand) =>
          brand.name.ko.toLowerCase().includes(query.toLowerCase()) ||
          brand.name.en.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands([]);
    }
  };

  const handleBrandRequest = async () => {
    if (!brandQuery.trim()) return;

    setIsLoading(true);
    try {
      await networkManager.request(
        "request/brand?name=" + brandQuery,
        "POST",
        null
      );
      alert("브랜드 요청이 완료되었습니다.");
      setShowBrandRequest(false);
    } catch (error) {
      console.error("브랜드 요청에 실패했습니다:", error);
      alert("브랜드 요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#1A1A1A] rounded-lg">
      {/* 브랜드 검색 */}
      {!hasFields.hasBrand && (
        <div>
          <h2 className="text-lg text-gray-400 font-bold mb-2">
            브랜드 검색하기
          </h2>
          <div className="relative">
            <input
              type="text"
              value={brandQuery}
              onChange={(e) => handleBrandSearch(e.target.value)}
              placeholder="브랜드 이름을 입력해주세요."
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />

            {/* 검색 결과 드롭다운 */}
            {filteredBrands.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredBrands.map((brand, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFields((prev) => ({
                        ...prev,
                        brand: brand.docId,
                      }));
                      onUpdate({ ...fields, brand: brand.docId });
                      setBrandQuery(brand.name.ko);
                      setFilteredBrands([]);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <>
                      {brand.name.ko}
                      <span className="text-gray-500 ml-2">
                        ({brand.name.en})
                      </span>
                    </>
                  </button>
                ))}
              </div>
            )}

            {/* 브랜드가 검색되지 않을 때 요청 버튼 */}
            {brandQuery && filteredBrands.length === 0 && !showBrandRequest && (
              <button
                onClick={() => setShowBrandRequest(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                브랜드 추가
              </button>
            )}
          </div>

          {/* 브랜드 요청 폼 */}
          {showBrandRequest && (
            <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border">
              <h4 className="font-medium mb-2">브랜드 추가 요청</h4>
              <p className="text-sm text-gray-400 mb-4">
                요청하신 브랜드는 검토 후 추가됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBrandRequest}
                  disabled={isLoading}
                  className={`px-4 py-2 text-black rounded ${
                    isLoading
                      ? "bg-blue-400"
                      : "bg-[#EAFD66] hover:bg-[#EAFD66]"
                  }`}
                >
                  {isLoading ? "요청 중..." : "요청하기"}
                </button>
                <button
                  onClick={() => setShowBrandRequest(false)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1A1A1A] rounded hover:bg-[#1A1A1A]"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 추가 정보 입력 */}
      <div className="mt-4">
        <h2 className="text-lg text-gray-400 font-bold mb-2">추가 정보 입력</h2>
        <div className="space-y-2">
          {!hasFields.hasName && (
            <input
              type="text"
              name="name"
              placeholder="아이템 이름"
              value={fields.name || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasBrand && (
            <input
              type="text"
              name="brand"
              placeholder="브랜드"
              value={fields.brand || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasDescription && (
            <input
              type="text"
              name="description"
              placeholder="아이템 설명"
              value={fields.description || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasMaterial && (
            <input
              type="text"
              name="material"
              placeholder="소재"
              value={fields.material || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasDesignedBy && (
            <input
              type="text"
              name="designedBy"
              placeholder="디자이너"
              value={fields.designedBy || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasColor && (
            <input
              type="text"
              name="color"
              placeholder="색상"
              value={fields.color || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
