import React, { useState, useEffect, useCallback } from "react";
import { networkManager } from "@/network/network";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

interface Curation {
  docId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  items: string[];
  createdAt: string;
}

type CurationType = "identity" | "brand" | "context";
type ContentType = "main_page" | "detail_page";

const CurationAddPage = () => {
  const [curations, setCurations] = useState<Curation[]>([]);
  console.log("[curations]", curations);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File>();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType | "">("");
  const [curationType, setCurationType] = useState<CurationType | "">("");
  const { ref, inView } = useInView();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !thumbnailFile) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("thumbnail", thumbnailFile);
      formData.append("content_type", contentType);
      formData.append("curation_type", curationType);

      await networkManager.request(
        `admin/${userDocId}/curation/create`,
        "POST",
        formData,
        accessToken
      );

      alert("큐레이션이 성공적으로 생성되었습니다.");
      setTitle("");
      setDescription("");
      setThumbnailFile(undefined);
      setThumbnailPreview(null);
      fetchCurations();
    } catch (error) {
      console.error("큐레이션 생성 실패:", error);
      alert("큐레이션 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurations = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const queryParams = new URLSearchParams();
      if (contentType) queryParams.append("content_type", contentType);
      if (curationType) queryParams.append("curation_type", curationType);

      const response = await networkManager.request(
        `admin/${userDocId}/curation/featured${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`,
        "GET",
        null,
        accessToken
      );

      setCurations(response.data.curations || []);
    } catch (error) {
      console.error("큐레이션 목록을 불러오는데 실패했습니다:", error);
    }
  }, [contentType, curationType]);

  useEffect(() => {
    fetchCurations();
  }, [fetchCurations]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 큐레이션 추가 섹션 */}
      <div className="bg-[#222222] shadow rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-400 mb-6">큐레이션 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                콘텐츠 타입
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
              >
                <option value="">전체</option>
                <option value="main_page">메인 페이지</option>
                <option value="detail_page">상세 페이지</option>
              </select>
            </div>
            <select
              value={curationType}
              onChange={(e) => setCurationType(e.target.value as CurationType)}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
            >
              <option value="">전체</option>
              <option value="identity">아이덴티티</option>
              <option value="brand">브랜드</option>
              <option value="context">컨텍스트</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              썸네일
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative w-32 h-32 bg-[#1A1A1A] rounded-lg overflow-hidden">
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1A1A1A] file:text-[#EAFD66] hover:file:bg-[#2A2A2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#EAFD66] text-black rounded-lg hover:bg-[#dbed5d] disabled:bg-gray-600 disabled:text-gray-400"
            >
              {isLoading ? "처리중..." : "큐레이션 추가"}
            </button>
          </div>
        </form>
      </div>

      {/* 큐레이션 목록 섹션 */}
      <div className="bg-[#222222] shadow rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-400 mb-6">큐레이션 목록</h2>
        {curations.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-xl font-semibold text-[#EAFD66]">
              등록된 큐레이션이 없습니다
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curations.map((curation) => (
              <div
                key={curation.docId}
                className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-gray-700"
              >
                <div className="relative aspect-video">
                  <Image
                    src={curation.thumbnailUrl}
                    alt={curation.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-200">
                    {curation.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                    {curation.description}
                  </p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                      수정
                    </button>
                    <button className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurationAddPage;
