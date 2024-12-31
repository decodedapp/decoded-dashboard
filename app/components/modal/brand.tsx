import { useState, useEffect } from "react";
import { BrandInfo, LinkInfo } from "@/types/model";
import { networkManager } from "@/network/network";
import { arrayBufferToBase64 } from "@/utils/util";

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
  const [logoImage, setLogoImage] = useState<File>();
  const [linkInfo, setLinkInfo] = useState<LinkInfo[]>([]);
  const [linkLabels, setLinkLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchLinkLabels = async () => {
      const response = await networkManager.request(`link/labels`, "GET");
      setLinkLabels(response.data);
    };
    fetchLinkLabels();
  }, []);

  const defaultState = () => {
    setBrandName({ en: "", ko: "" });
    setLogoImage(undefined);
    setLinkInfo([]);
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

    if (!logoImage) {
      alert("Brand logo is not set!");
      return;
    }
    const newBrandInfo: BrandInfo = {
      name: brandName,
      linkInfo: linkInfo,
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
      className="modal fixed inset-0 m-auto w-[90vw] h-[90vh] max-w-2xl p-6 bg-[#1A1A1A] rounded-lg shadow-xl"
    >
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-gray-400">
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
          <p className="text-sm font-bold text-gray-400">브랜드명</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="영문 브랜드명"
              className="px-3 py-2 rounded-md bg-[#1A1A1A]"
              value={brandName.en}
              onChange={(e) =>
                setBrandName({ ...brandName, en: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="한글 브랜드명"
              className="px-3 py-2  rounded-md bg-[#1A1A1A]"
              value={brandName.ko}
              onChange={(e) =>
                setBrandName({ ...brandName, ko: e.target.value })
              }
            />
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-400">로고</p>
          <div className="flex justify-center px-6 pt-5 pb-6 rounded-md">
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
              <div className="flex justify-center text-sm text-gray-400">
                <label className="relative cursor-pointer rounded-md font-medium text-[#EAFD66] hover:text-[#EAFD66] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#EAFD66]">
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
          className="w-full px-4 py-2 bg-[#EAFD66] text-black rounded-md hover:bg-[#EAFD66] transition-colors duration-200"
        >
          저장하기
        </button>
      </div>
    </dialog>
  );
};
