import React, { useState, useEffect } from "react";
import { networkManager } from "@/network/network";
import { BrandModal } from "./modal/brand";

const BrandRequestSection = () => {
  const [brandRequests, setBrandRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataAdded, setIsDataAdded] = useState(false);

  const fetchBrandRequests = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
      }
      const res = await networkManager.request(
        `admin/${userDocId}/request?doc_type=brands`,
        "GET",
        null,
        accessToken
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

export default BrandRequestSection;
