import React, { useEffect, useState } from "react";
import { networkManager } from "@/network/network";
import Image from "next/image";

interface ImageDoc {
  doc_id: string;
  img_url: string;
  title?: string;
}

interface SearchImageDoc {
  _id: string;
  img_url: string;
  title: string | null;
  description: string | null;
}

type CurationType = "identity" | "brand" | "context";
type ContentType = "main_page" | "detail_page";

const CurationAddPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subImageFile, setSubImageFile] = useState<File>();
  const [subImagePreview, setSubImagePreview] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [curationType, setCurationType] = useState<CurationType | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<ImageDoc[]>([]);
  console.log(searchResults);
  const [searchQuery, setSearchQuery] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchImages = async () => {
    try {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      const response = await networkManager.request(
        `search?query=${encodeURIComponent(searchQuery)}`,
        "GET",
        null
      );
      const images = response.data.related_images || [];
      setSearchResults(
        images.map((img: SearchImageDoc) => ({
          doc_id: img._id,
          img_url: img.img_url,
          title: img.title || "제목 없음",
        }))
      );
    } catch (error) {
      console.error("이미지 검색 실패:", error);
      alert("이미지 검색에 실패했습니다.");
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearchImages();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contentType || !curationType || selectedDocs.length === 0) {
      alert("필수 필드를 입력해주세요.");
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

      let base64Image = null;
      if (subImageFile) {
        const buffer = await subImageFile.arrayBuffer();
        base64Image = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
      }

      const requestBody = {
        content_type: contentType,
        curation_type: curationType,
        title,
        sub_title: subTitle,
        description,
        sub_image_base64: base64Image,
        docs: selectedDocs,
      };
      console.log(requestBody);

      await networkManager.request(
        `admin/${userDocId}/curation/add`,
        "POST",
        requestBody,
        accessToken
      );

      alert("큐레이션이 성공적으로 생성되었습니다.");
      resetForm();
    } catch (error) {
      console.error("큐레이션 생성 실패:", error);
      alert("큐레이션 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubTitle("");
    setDescription("");
    setSubImageFile(undefined);
    setSubImagePreview(null);
    setSelectedDocs([]);
    setSearchResults([]);
    setSearchQuery("");
    setContentType(null);
    setCurationType(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#222222] shadow rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-400 mb-6">큐레이션 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                콘텐츠 타입*
              </label>
              <select
                value={contentType || ""}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
                required
              >
                <option value="">선택해주세요</option>
                <option value="main_page">메인 페이지</option>
                <option value="detail_page">상세 페이지</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                큐레이션 타입*
              </label>
              <select
                value={curationType || ""}
                onChange={(e) =>
                  setCurationType(e.target.value as CurationType)
                }
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
                required
              >
                <option value="">선택해주세요</option>
                <option value="identity">아이덴티티</option>
                <option value="brand">브랜드</option>
                <option value="context">컨텍스트</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              제목*
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              부제목
            </label>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              서브 이미지
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative w-32 h-32 bg-[#1A1A1A] rounded-lg overflow-hidden">
                {subImagePreview ? (
                  <Image
                    src={subImagePreview}
                    alt="Sub image preview"
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
                onChange={handleImageChange}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1A1A1A] file:text-[#EAFD66] hover:file:bg-[#2A2A2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              이미지 문서 선택*
            </label>

            {/* 검색 입력 필드 */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이미지 검색..."
                className="flex-1 px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200"
              />
            </div>

            {/* 선택된 이미지 목록 */}
            {selectedDocs.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  선택된 이미지 ({selectedDocs.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocs.map((docId) => (
                    <div
                      key={docId}
                      className="px-3 py-1 bg-[#2A2A2A] rounded-full text-sm text-gray-200 flex items-center"
                    >
                      <span className="mr-2">{docId}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDocs((docs) =>
                            docs.filter((id) => id !== docId)
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 검색 결과 표시 */}
            <div className="grid grid-cols-4 gap-4">
              {searchResults.length > 0
                ? searchResults.map((doc) => (
                    <div
                      key={doc.doc_id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border border-gray-700
                    ${
                      selectedDocs.includes(doc.doc_id)
                        ? "ring-2 ring-[#EAFD66]"
                        : ""
                    }`}
                      onClick={() => {
                        setSelectedDocs((docs) =>
                          docs.includes(doc.doc_id)
                            ? docs.filter((id) => id !== doc.doc_id)
                            : [...docs, doc.doc_id]
                        );
                      }}
                    >
                      <div className="relative aspect-w-4 aspect-h-5">
                        <Image
                          src={doc.img_url}
                          alt={doc.title || ""}
                          fill
                          className="object-cover"
                        />
                        {selectedDocs.includes(doc.doc_id) && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-[#EAFD66]"
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
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                : searchQuery && (
                    <div className="col-span-4 text-center py-8 text-gray-400">
                      검색 결과가 없습니다
                    </div>
                  )}
            </div>
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
    </div>
  );
};

export default CurationAddPage;
