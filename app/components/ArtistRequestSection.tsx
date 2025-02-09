import React, { useState, useEffect } from "react";
import { networkManager } from "@/network/network";
import { IdentityModal } from "./modal/identity";

const ArtistRequestSection = () => {
  const [artistRequests, setArtistRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArtistRequests = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
      }
      const res = await networkManager.request(
        `admin/${userDocId}/request?doc_type=identities`,
        "GET",
        null,
        accessToken
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

export default ArtistRequestSection;
