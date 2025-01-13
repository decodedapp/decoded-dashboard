import { useEffect, useState } from "react";
import { IdentityInfo, LinkInfo } from "@/types/model";
import { networkManager } from "@/network/network";
import { arrayBufferToBase64 } from "@/utils/util";

export const IdentityModal = ({
  id,
  requestId,
  identityName,
  identityCategory,
  onUpdate,
}: {
  id: number;
  requestId: string;
  identityName: Record<string, string>;
  identityCategory: string;
  onUpdate: () => void;
}) => {
  const [name, setName] = useState<Record<string, string>>({
    ko: identityName?.ko || "",
    en: identityName?.en || "",
  });
  const [category, setCategory] = useState<string>(identityCategory);
  const [linkInfo, setLinkInfo] = useState<LinkInfo[]>([]);
  const [linkLabels, setLinkLabels] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    const fetchLinkLabels = async () => {
      const response = await networkManager.request(`item/labels`, "GET");
      setLinkLabels(response.data);
    };
    fetchLinkLabels();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // 이미지 미리보기 URL 생성
    }
  };

  const defaultState = () => {
    setLinkInfo([]);
    setImageFile(undefined);
    setImagePreview(null);
    setName({ en: "", ko: "" });
    setCategory("");
  };

  const upload = async () => {
    if (!name || !imageFile) {
      alert("필수 입력 항목을 입력해주세요.");
      return;
    }
    const newIdentityInfo: IdentityInfo = {
      name: name,
      category: category,
      linkInfo: linkInfo,
    };
    const buf = await imageFile.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const requestBody = {
      identity_info: newIdentityInfo,
      image_file: base64,
    };
    const accessToken = localStorage.getItem("access_token");
    const userDocId = sessionStorage.getItem("USER_DOC_ID");
    if (!userDocId) {
      alert("로그인이 필요합니다.");
      return;
    }
    await networkManager.request(
      `admin/${userDocId}/identity/upload/${requestId}`,
      "POST",
      requestBody,
      accessToken
    );
    defaultState();
    onUpdate();
    alert("Identity is added successfully!");
  };

  return (
    <dialog
      id={`identity_modal_${id}`}
      className="modal flex flex-col w-[90vw] max-w-4xl h-[90vh] p-6 bg-[#1A1A1A] rounded-lg left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] overflow-y-auto"
    >
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-400 pb-4">
          <h2 className="text-lg font-semibold text-gray-400">
            아이덴티티 정보 수정
          </h2>
          <button
            onClick={() =>
              (
                document.getElementById(
                  `identity_modal_${id}`
                ) as HTMLDialogElement
              )?.close()
            }
            className="text-gray-400 hover:text-gray-500"
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

        {/* Profile Image */}
        <div className="space-y-4">
          {/* 이미지 업로드 토글 버튼 */}
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="w-full px-3 py-2 text-sm bg-[#2A2A2A] text-gray-400 rounded-md hover:bg-[#3A3A3A] flex items-center justify-center gap-2"
          >
            <span>
              {showImageUpload ? "프로필 이미지 취소" : "프로필 이미지 추가"}
            </span>
            {showImageUpload ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>

          {/* 이미지 업로드 섹션 */}
          {showImageUpload && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-400">프로필 이미지</p>
              <div
                className="relative flex items-center justify-center w-full rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] transition duration-150 ease-in-out cursor-pointer"
                style={{ aspectRatio: "1 / 1" }}
              >
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="absolute inset-0 object-cover w-full h-full rounded-lg"
                  />
                )}
                <label className="flex flex-col items-center justify-center w-full h-full bg-black/50 transition-opacity duration-150 ease-in-out">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
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
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">클릭하여 업로드</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG (최대 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Artist Name */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">아티스트 이름</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="영어 이름 (예: Jennie)"
              className="px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
              value={name.en}
              onChange={(e) => setName({ ...name, en: e.target.value })}
            />
            <input
              type="text"
              placeholder="한국어 이름 (예: 제니)"
              className="px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
              value={name.ko}
              onChange={(e) => setName({ ...name, ko: e.target.value })}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">카테고리</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="아티스트 카테고리 (예: K-POP)"
              className="px-3 py-2 rounded-md bg-[#1A1A1A] text-gray-400"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">링크 정보</p>
          <div className="space-y-4 ">
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
                    value={info.url}
                    onChange={(e) => {
                      const newLinkInfo = [...linkInfo];
                      newLinkInfo[index].url = e.target.value;
                      setLinkInfo(newLinkInfo);
                    }}
                    placeholder="URL을 입력하세요"
                  />
                </div>
                {/* 삭제 버튼 */}
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

            {/* 추가 버튼 */}
            <button
              onClick={() => {
                setLinkInfo([...linkInfo, { label: "", url: "" }]);
              }}
              className="w-full px-3 py-2 text-sm bg-[#2A2A2A] text-gray-400 rounded-md hover:bg-[#3A3A3A]"
            >
              + 링크 추가
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={upload}
          className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-[#EAFD66] transition-colors duration-200 mt-6 hover:text-black"
        >
          저장하기
        </button>
      </div>
    </dialog>
  );
};
