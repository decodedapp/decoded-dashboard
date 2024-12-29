import { useState } from "react";
import { BrandInfo } from "@/types/model";
import { networkManager } from "@/network/network";
import { arrayBufferToBase64 } from "@/utils/util";

enum SnsType {
  Instagram = "instagram",
  Youtube = "youtube",
}

export const BrandModal = ({
  id,
  requestId,
  onClose,
}: {
  id: number;
  requestId: string;
  onClose: () => void;
}) => {
  const [brandName, setBrandName] = useState<Record<string, string>>({
    en: "",
    ko: "",
  });
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [logoImage, setLogoImage] = useState<File>();
  const [sns, setSns] = useState<Record<string, string>>({});
  const handleSnsUrlChange =
    (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSns({ ...sns, [type]: e.target.value });
    };

  const defaultState = () => {
    setBrandName({ en: "", ko: "" });
    setWebsiteUrl("");
    setLogoImage(undefined);
    setSns({});
  };

  const onComplete = () => {
    defaultState();
    onClose();
  };

  const upload = async () => {
    if (!brandName) {
      alert("브랜드 이름을 입력해주세요.");
      return;
    }

    if (!websiteUrl || !logoImage || !sns) {
      alert("Brand category or creative director is not set!");
      return;
    }
    const snsInfo = Object.entries(sns).map(([platform, url]) => ({
      platform: platform,
      url: url,
    }));
    const newBrandInfo: BrandInfo = {
      name: brandName,
      websiteUrl: websiteUrl,
      snsInfo: snsInfo,
    };
    const buf = await logoImage.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const uploadBrand = {
      brandInfo: newBrandInfo,
      imageFile: base64,
    };
    console.log("uploadBrand", uploadBrand);
    await networkManager
      .request(`brand/upload/${requestId}`, "POST", uploadBrand)
      .then((_) => {
        alert("브랜드 업로드 성공");
        onComplete();
      })
      .catch((err) => {
        alert("브랜드 업로드 실패");
        console.log(err);
      });
  };

  return (
    <dialog
      id={`brand_modal_${id}`}
      className="modal fixed inset-0 m-auto w-[90vw] h-[90vh] max-w-2xl p-6 bg-white rounded-lg shadow-xl"
    >
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            브랜드 정보 수정
          </h2>
          <button
            onClick={() =>
              (
                document.getElementById(
                  `brand_modal_${id}`
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

        {/* Brand Name */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">브랜드명</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="영문 브랜드명"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={brandName.en}
              onChange={(e) =>
                setBrandName({ ...brandName, en: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="한글 브랜드명"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={brandName.ko}
              onChange={(e) =>
                setBrandName({ ...brandName, ko: e.target.value })
              }
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">웹사이트</p>
          <input
            type="text"
            placeholder="웹사이트 URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">로고</p>
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {logoImage ? (
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={URL.createObjectURL(logoImage)}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setLogoImage(undefined)}
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
              )}
              <div className="flex justify-center text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                  <span>{logoImage ? "로고 변경" : "로고 업로드"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      e.target.files && setLogoImage(e.target.files[0])
                    }
                  />
                </label>
              </div>
            </div>
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
                  value={sns[snsType] || ""}
                  onChange={handleSnsUrlChange(snsType)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={upload}
          className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
        >
          저장하기
        </button>
      </div>
    </dialog>
  );
};
