import { useState } from "react";
import { IdentityInfo } from "@/types/model";
import { networkManager } from "@/network/network";
import { arrayBufferToBase64 } from "@/utils/util";

enum SnsType {
  Instagram = "instagram",
  Youtube = "youtube",
}

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
  const [aka, setAka] = useState<string[]>([]);
  const [group, setGroup] = useState<Record<string, string>>({
    en: "",
    ko: "",
  });
  const [nationality, setNationality] = useState<string | null>(null);
  const [snsUrls, setSnsUrls] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // 이미지 미리보기 URL 생성
    }
  };

  const handleSnsUrlChange =
    (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSnsUrls({ ...snsUrls, [type]: e.target.value });
    };

  const handleAkaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const akaArray = e.target.value.split(",").map((item) => item.trim()); // 쉼표로 분리하고 공백 제거
    setAka(akaArray);
  };

  const defaultState = () => {
    setAka([]);
    setGroup({ en: "", ko: "" });
    setSnsUrls({});
    setNationality(null);
    setImageFile(undefined);
    setImagePreview(null);
    setName({ en: "", ko: "" });
    setCategory("");
  };

  const upload = async () => {
    if (!name || !imageFile || !nationality) {
      alert("필수 입력 항목을 입력해주세요.");
      return;
    }
    const snsInfo = Object.entries(snsUrls).map(([platform, url]) => ({
      platform: platform,
      url: url,
    }));
    const newIdentityInfo: IdentityInfo = {
      name: name,
      category: category,
      nationality: nationality,
      aka: aka,
      group: group,
      snsInfo: snsInfo,
    };
    const buf = await imageFile.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const requestBody = {
      identity_info: newIdentityInfo,
      image_file: base64,
    };
    console.log(requestBody);
    await networkManager.request(
      `upload/identity?request=${requestId}`,
      "POST",
      requestBody
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
          <p className="text-sm font-medium text-gray-400">프로필 이미지</p>
          <div
            className="relative flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer"
            style={{ aspectRatio: "1 / 1" }}
          >
            {imagePreview && (
              <img
                src={imagePreview}
                alt="미리보기"
                className="absolute inset-0 object-cover w-full h-full rounded-lg"
              />
            )}
            <label className="flex flex-col items-center justify-center w-full h-full opacity-0 bg-black/50 hover:opacity-100 transition-opacity duration-150 ease-in-out ">
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
                <p className="text-xs text-gray-500">PNG, JPG (최대 10MB)</p>
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

        {/* Artist Name */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">아티스트 이름</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="영어 이름 (예: Jennie)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={name.en}
              onChange={(e) => setName({ ...name, en: e.target.value })}
            />
            <input
              type="text"
              placeholder="한국어 이름 (예: 제니)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">국적</p>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={nationality || ""}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option value="" disabled>
              국적을 선택하세요
            </option>
            <option value="kr">대한민국</option>
            <option value="us">미국</option>
            <option value="jp">일본</option>
            <option value="cn">중국</option>
            <option value="gb">영국</option>
            <option value="th">태국</option>
            <option value="tw">대만</option>
          </select>
        </div>

        {/* AKA */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">별명 (a.k.a)</p>
          <input
            type="text"
            placeholder="쉼표로 구분하여 입력 (예: 제니, Jennie Kim)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={aka.join(", ")}
            onChange={handleAkaChange}
          />
        </div>

        {/* Group */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">소속 그룹</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="영어 (예: BLACKPINK)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={group.en}
              onChange={(e) => setGroup({ ...group, en: e.target.value })}
            />
            <input
              type="text"
              placeholder="한글 (예: 블랙핑크)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={group.ko}
              onChange={(e) => setGroup({ ...group, ko: e.target.value })}
            />
          </div>
        </div>

        {/* SNS */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">SNS 정보</p>
          <div className="space-y-4">
            {Object.values(SnsType).map((snsType) => (
              <div key={snsType}>
                <label className="block text-xs text-gray-500 mb-1">
                  {snsType.toUpperCase()}
                </label>
                <input
                  type="text"
                  placeholder={`${snsType} URL을 입력하세요`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={snsUrls[snsType] || ""}
                  onChange={handleSnsUrlChange(snsType)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={upload}
          className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 mt-6"
        >
          저장하기
        </button>
      </div>
    </dialog>
  );
};
