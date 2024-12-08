import { useState, useEffect } from "react";
import {
  ItemDocument,
  ProvideData,
  BrandData,
  ItemDetail,
} from "@/types/model";
import {
  MainCategory,
  SubCategoryMap,
  InstanceMap,
  categories,
} from "@/constants/categories";
import { networkManager } from "@/network/network";
import { convertKeysToCamelCase } from "@/utils/util";
import Image from "next/image";
import { arrayBufferToBase64 } from "@/utils/util";

interface ProvideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProvideData) => void;
  item: ItemDocument;
}

interface FieldStatus {
  disabled: boolean;
  status?: "provided" | "finalized";
}

export const ProvidePanel = ({
  isOpen,
  onClose,
  item,
  onSubmit,
}: ProvideModalProps) => {
  console.log("Item", item);
  const [provideData, setProvideData] = useState<ProvideData | null>(null);
  console.log("ProvideData", provideData);
  const category = item.category as MainCategory;
  const [selectedSub, setSelectedSub] = useState<
    keyof (typeof categories)[typeof category] | undefined
  >(undefined);
  const [selectedInstance, setSelectedInstance] =
    useState<InstanceMap<typeof category, SubCategoryMap<typeof category>>>();
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [isBrandSelected, setIsBrandSelected] = useState<boolean>(false);
  const [isSaleUrlEntered, setIsSaleUrlEntered] = useState<boolean>(false);
  const [affiliateCheckMessage, setAffiliateCheckMessage] =
    useState<string>("");

  const checkAffiliateLink = (url: string) => {
    setAffiliateCheckMessage("제휴 링크 확인 중...");
    setTimeout(() => {
      setAffiliateCheckMessage("제휴 링크가 아닙니다.");
    }, 2000);
  };

  // 메인 카테고리를 MainCategory 타입으로 변환
  const subCategories = Object.keys(categories[category]) as SubCategoryMap<
    typeof category
  >[];
  const instances = selectedSub ? categories[category][selectedSub] : [];
  const requiredFields = [
    { key: "name", label: "상품명" },
    { key: "brand", label: "브랜드" },
    { key: "saleInfo", label: "판매 정보" },
    { key: "subCategory", label: "카테고리" },
    { key: "productType", label: "하위 카테고리" },
  ] as const;

  const optionalFields = [
    { key: "designedBy", label: "디자이너" },
    { key: "material", label: "소재" },
  ] as const;

  const filteredBrands = brands.filter(
    (brand) =>
      brand.ko.toLowerCase().includes(brandSearch.toLowerCase()) ||
      brand.en.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleRequestBrand = async (brandName: string) => {
    const requestBy = sessionStorage.getItem("USER_DOC_ID");
    if (!requestBy) {
      alert("로그인이 필요합니다.");
      return;
    }
    const requestBrand = {
      name: brandName,
      requestBy: requestBy,
    };
    await networkManager
      .request("request/brand", "POST", requestBrand)
      .then(() => {
        console.log(`브랜드 요청: ${brandName}`);
        alert(`브랜드 요청이 접수되었습니다: ${brandName}`);
        setBrandSearch("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleSubmit = () => {
    if (!provideData) {
      alert("정보를 입력해주세요.");
      return;
    }
    onSubmit(provideData);
    onClose();
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setProvideData(null);
    setSelectedSub(undefined);
    setSelectedInstance(undefined);
    setBrandSearch("");
    onClose();
  };

  const isFieldDisabled = (fieldKey: keyof ItemDocument) => {
    const field = item[fieldKey];
    if (field && typeof field === "object" && "provideInfo" in field) {
      const provideInfo = (field as ItemDetail<any>).provideInfo;
      return (
        provideInfo?.provideStatus === "provided" ||
        provideInfo?.provideStatus === "finalized"
      );
    }
    return false;
  };
  const getFieldStatus = (fieldKey: keyof ItemDocument): FieldStatus => {
    const field = item[fieldKey];
    if (field && typeof field === "object" && "provideInfo" in field) {
      const provideInfo = (field as ItemDetail<any>).provideInfo;
      if (
        provideInfo?.provideStatus === "provided" ||
        provideInfo?.provideStatus === "finalized"
      ) {
        return {
          disabled: true,
          status: provideInfo.provideStatus,
        };
      }
    }
    return { disabled: false };
  };

  const getStatusMessage = (status?: "provided" | "finalized") => {
    if (status === "provided") return "이미 정보가 제공되어 검토 중입니다";
    if (status === "finalized") return "이미 확정된 정보입니다";
    return "";
  };

  useEffect(() => {
    setProvideData((prev) => ({
      ...prev,
      docId: item.Id,
    }));
  }, [item.Id]);

  useEffect(() => {
    const fetchBrands = async () => {
      await networkManager
        .request("brands", "GET", null)
        .then((response) => {
          const data = convertKeysToCamelCase(response.data);
          console.log("Data", data);
          const fetchedBrands: BrandData[] = [];
          for (const brand of data.brands) {
            fetchedBrands.push({
              ko: brand.name.ko,
              en: brand.name.en,
              docId: brand.Id,
              logoImageUrl: brand.logoImageUrl,
            });
          }
          setBrands(fetchedBrands);
        })
        .catch((error) => {
          console.error(error);
          setBrands([]);
        });
    };

    fetchBrands();
  }, []);

  return (
    <div
      className={`top-0 left-0 w-full h-full transform 
                    transition-transform duration-300 bg-[#111111] overflow-y-auto
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="max-w-[1400px] mx-auto p-6 h-auto flex flex-col">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleClose}
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
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            아이템 정보 제공
          </h2>
          <div className="p-4 bg-gradient-to-b from-[#1A1A1A] to-[#222] rounded-lg border border-blue-500/10">
            <p className="text-gray-300 text-sm leading-relaxed">
              아이템에 대한 정확한 정보를 제공해주세요. 정보를 입력하시면 보상을
              받으실 수 있습니다.
              <span className="block mt-2 text-blue-400">
                * 모든 정보는 검증 후 반영되며, 정확한 정보 제공 시 보상이
                지급됩니다.
              </span>
            </p>
          </div>
        </div>
        <div className="max-w-full space-y-6 mt-10">
          <div className="space-y-6">
            {/* SubCategory and Instance Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                카테고리
              </label>
              <div className="grid grid-cols-2 gap-2">
                {subCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSub(
                        sub as keyof (typeof categories)[typeof category]
                      );
                      setSelectedInstance(undefined);
                      setProvideData({
                        ...provideData,
                        subCategory: sub,
                      });
                    }}
                    disabled={isFieldDisabled("subCategory")}
                    className={`px-4 py-2 text-sm rounded-md border transition-all duration-200 
                      ${
                        isFieldDisabled("subCategory")
                          ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                          : selectedSub === sub
                          ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                          : "bg-[#1A1A1A] text-white border-white/5 hover:bg-[#252525]"
                      }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              {selectedSub && (
                <div className="space-y-2 flex flex-col">
                  <label className="block text-sm font-medium text-gray-300">
                    하위 카테고리
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {instances.map((instance) => (
                      <button
                        key={instance}
                        onClick={() => {
                          setSelectedInstance(instance);
                          setProvideData({
                            ...provideData,
                            productType: instance,
                          });
                        }}
                        className={`px-4 py-2 text-sm rounded-md border transition-all duration-200 
                        ${
                          selectedInstance === instance
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                            : "bg-[#1A1A1A] text-white border-white/5 hover:bg-[#252525] hover:border-blue-500/50 hover:scale-[1.02] hover:shadow-md"
                        }`}
                      >
                        {instance}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Information */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                브랜드
              </label>
              <input
                type="text"
                placeholder="브랜드를 검색하세요"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                disabled={getFieldStatus("brand").disabled}
                className={`w-full px-4 py-3 rounded-lg border transition-colors outline-none
                  ${
                    getFieldStatus("brand").disabled
                      ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                      : "bg-[#1A1A1A] text-white border-white/5 focus:border-blue-500"
                  }`}
              />
              {getFieldStatus("brand").disabled && (
                <div className="absolute invisible group-hover:visible w-full p-2 bg-gray-800 text-sm text-gray-300 rounded-md shadow-lg -bottom-12 left-0 z-10">
                  {getStatusMessage(getFieldStatus("brand").status)}
                </div>
              )}
              <div className="mt-2">
                {brandSearch.length > 0 &&
                  filteredBrands.map((brand, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setBrandSearch(brand.ko + " (" + brand.en + ")");
                        setIsBrandSelected(true);
                        setProvideData({
                          ...provideData,
                          brand: brand.docId,
                        });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm rounded-md border transition-colors
                           bg-[#1A1A1A] text-white border-white/5 hover:border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {brand.logoImageUrl ? (
                          <Image
                            src={brand.logoImageUrl}
                            alt={`${brand.en} logo`}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">
                              {brand.en.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>
                          {brand.ko}{" "}
                          <span className="text-gray-400">({brand.en})</span>
                        </span>
                      </div>
                    </button>
                  ))}
                {filteredBrands.length === 0 &&
                  brandSearch &&
                  !isBrandSelected && (
                    <button
                      onClick={() => handleRequestBrand(brandSearch)}
                      className="block w-full text-left px-4 py-2 text-sm rounded-md border transition-colors
                           bg-red-500 text-white border-red-500 hover:bg-red-600"
                    >
                      "{brandSearch}" 브랜드 요청하기
                    </button>
                  )}
              </div>
            </div>

            {/* Sale URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                판매 URL
              </label>
              <input
                type="url"
                placeholder="판매 URL을 입력하세요"
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg border border-white/5 
                        text-white placeholder-gray-500 focus:border-blue-500 
                        focus:ring-1 focus:ring-blue-500 transition-colors outline-none
                        hover:border-white/10"
                onChange={(e) => {
                  const url = e.target.value;
                  setProvideData({
                    ...provideData,
                    saleUrl: e.target.value,
                  });
                  setIsSaleUrlEntered(url.length > 0);
                  if (url.length > 0) {
                    checkAffiliateLink(url);
                  } else {
                    setAffiliateCheckMessage("");
                  }
                }}
              />
              {affiliateCheckMessage && (
                <p className="text-sm text-red-500 mt-2">
                  {affiliateCheckMessage}
                </p>
              )}
            </div>

            {/* Conditional Fields based on Sale URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                상품명
              </label>
              <input
                type="text"
                placeholder={
                  isSaleUrlEntered
                    ? "상품명을 입력하세요"
                    : "판매 URL을 입력하면 활성화됩니다"
                }
                onChange={(e) =>
                  setProvideData({
                    ...provideData,
                    name: e.target.value,
                  })
                }
                disabled={!isSaleUrlEntered || isFieldDisabled("name")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors outline-none
                  ${
                    isFieldDisabled("name")
                      ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                      : "bg-[#1A1A1A] text-white border-white/5 focus:border-blue-500"
                  }`}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                          hover:bg-blue-600 transition-colors"
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
