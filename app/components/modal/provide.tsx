import { useState } from "react";
import { ItemDocument, SaleInfo } from "@/types/model";

interface ProvideModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDocument;
  //   onSubmit: (updatedFields: Partial<ItemDocument>) => void;
}

export const ProvidePanel = ({ isOpen, onClose, item }: ProvideModalProps) => {
  const [formData, setFormData] = useState<Partial<ItemDocument>>({});

  const itemDetailFields = [
    { key: "name", label: "상품명" },
    { key: "brand", label: "브랜드" },
    { key: "designedBy", label: "디자이너" },
    { key: "saleInfo", label: "판매 정보" },
    { key: "imageUrl", label: "이미지 URL" },
    { key: "subCategory", label: "서브 카테고리" },
    { key: "productType", label: "상품 타입" },
    { key: "material", label: "소재" },
  ] as const;

  return (
    <div
      className={`absolute top-0 left-0 w-full min-h-screen transform 
                    transition-transform duration-300 bg-[#111111] overflow-y-auto
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="max-w-[1400px] mx-auto p-6">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          돌아가기
        </button>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-white mb-8">아이템 정보 제공</h2>

        {/* 폼 필드들 */}
        <div className="max-w-full space-y-6">
          {itemDetailFields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {label}
              </label>
              {key === "saleInfo" ? (
                <input
                  type="url"
                  placeholder="판매 URL을 입력하세요"
                  className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg border border-white/5 
                              text-white placeholder-gray-500 focus:border-blue-500 
                              focus:ring-1 focus:ring-blue-500 transition-colors outline-none
                              hover:border-white/10"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saleInfo: {
                        value: [
                          {
                            url: e.target.value,
                            price: "",
                            currency: "KRW",
                            isAffiliated: false,
                            isSoldout: false,
                          },
                        ],
                        finalizedAt: "",
                        provideStatus: "requested",
                        provider: "",
                        requester: "",
                      },
                    })
                  }
                />
              ) : (
                <input
                  type="text"
                  placeholder={`${label}을(를) 입력하세요`}
                  className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg border border-white/5 
                              text-white placeholder-gray-500 focus:border-blue-500 
                              focus:ring-1 focus:ring-blue-500 transition-colors outline-none
                              hover:border-white/10"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [key]: {
                        value: e.target.value,
                        finalizedAt: "",
                        provideStatus: "requested",
                        provider: "",
                        requester: "",
                      },
                    })
                  }
                />
              )}
            </div>
          ))}

          {/* 제출 버튼 */}
          <div className="pt-6">
            <button
              onClick={() => {
                // onSubmit(formData);
                onClose();
              }}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                          hover:bg-blue-600 transition-colors"
            >
              제출하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
