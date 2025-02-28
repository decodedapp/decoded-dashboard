import React, { useState, useEffect } from "react";
import { networkManager } from "@/network/network";
import { LinkInfo } from "@/types/model";
import { arrayBufferToBase64 } from "@/utils/util";

const BrandAddPage = () => {
  const [name, setName] = useState<Record<string, string>>({
    ko: "",
    en: "",
  });
  const [linkInfo, setLinkInfo] = useState<LinkInfo[]>([]);
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [linkLabels, setLinkLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLinkLabels();
  }, []);

  const fetchLinkLabels = async () => {
    const response = await networkManager.request(`item/labels`, "GET");
    setLinkLabels(response.data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBrandSubmit = async () => {
    if (!name || !imageFile) {
      alert("브랜드 이름과 로고를 입력해주세요.");
      return;
    }

    const buf = await imageFile.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const requestBody = {
      name: name,
      image_file: base64,
      links: linkInfo, // Optional field
    };

    const accessToken = localStorage.getItem("access_token");
    const userDocId = sessionStorage.getItem("USER_DOC_ID");
    if (!userDocId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setIsLoading(true);
      await networkManager.request(
        `admin/${userDocId}/brand/upload`,
        "POST",
        requestBody,
        accessToken
      );
      alert("브랜드가 성공적으로 추가되었습니다!");
      // Reset form
      setName({ ko: "", en: "" });
      setLinkInfo([]);
      setImageFile(undefined);
      setImagePreview(null);
    } catch (error: any) {
      alert(
        error.response?.data?.description || "요청 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#222222] shadow rounded-lg p-6">
      <div className="flex flex-col space-y-6">
        {/* Logo Image */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">로고</p>
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setImageFile(undefined);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
              ) : (
                <label className="relative cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="mt-2 text-sm text-gray-400">
                      이미지를 선택하세요
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">이름</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="영문 이름"
              className="px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
              value={name.en}
              onChange={(e) => setName({ ...name, en: e.target.value })}
            />
            <input
              type="text"
              placeholder="한글 이름"
              className="px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
              value={name.ko}
              onChange={(e) => setName({ ...name, ko: e.target.value })}
            />
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">링크 정보</p>
          <div className="space-y-4">
            {linkInfo.map((info, index) => (
              <div
                key={index}
                className="space-y-2 border border-gray-700 rounded-lg p-4"
              >
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    라벨
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
                    value={info.label}
                    onChange={(e) => {
                      const newLinkInfo = [...linkInfo];
                      newLinkInfo[index].label = e.target.value;
                      setLinkInfo(newLinkInfo);
                    }}
                  >
                    <option value="">선택</option>
                    {linkLabels.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
                    value={info.value}
                    onChange={(e) => {
                      const newLinkInfo = [...linkInfo];
                      newLinkInfo[index].value = e.target.value;
                      setLinkInfo(newLinkInfo);
                    }}
                    placeholder="URL을 입력하세요"
                  />
                </div>
                <button
                  onClick={() => {
                    const newLinkInfo = linkInfo.filter((_, i) => i !== index);
                    setLinkInfo(newLinkInfo);
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ))}

            <button
              onClick={() => {
                setLinkInfo([...linkInfo, { label: "", value: "" }]);
              }}
              className="w-full px-3 py-2 text-sm bg-[#2A2A2A] text-gray-400 rounded-md hover:bg-[#3A3A3A]"
            >
              + 링크 추가
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleBrandSubmit}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-[#EAFD66] text-black rounded-md hover:bg-[#EAFD66] transition-colors duration-200"
        >
          {isLoading ? "처리 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
};

export default BrandAddPage;
