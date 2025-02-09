import React, { useState, useEffect } from "react";
import { networkManager } from "@/network/network";
import { HasFields, AdditionalMetadata, MetadataResponse } from "@/types/model";

const AdditionalFieldsForm = ({
  hasFields,
  onUpdate,
  metadata,
}: {
  hasFields: HasFields;
  onUpdate: (fields: AdditionalMetadata) => void;
  metadata?: MetadataResponse;
}) => {
  const [fields, setFields] = useState<AdditionalMetadata>({});
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandRequest, setShowBrandRequest] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState<
    { name: { ko: string; en: string }; docId: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<
    { name: { ko: string; en: string }; docId: string }[]
  >([]);
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await networkManager.request("brand", "GET", null);
        const brand_docs = response.data.brands;
        setBrands(
          brand_docs.map((brand: any) => ({
            name: { ko: brand.name.ko, en: brand.name.en },
            docId: brand._id,
          }))
        );
      } catch (error) {
        console.error("브랜드 목록을 불러오는데 실패했습니다:", error);
      }
    };

    fetchBrands();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFields = { ...fields, [name]: value };
    if (value === "") {
      delete updatedFields[name as keyof AdditionalMetadata];
    }
    setFields(updatedFields);
    onUpdate(updatedFields);
  };

  const handleBrandSearch = (query: string) => {
    setBrandQuery(query);
    if (query.length > 0) {
      const filtered = brands.filter(
        (brand) =>
          brand.name.ko.toLowerCase().includes(query.toLowerCase()) ||
          brand.name.en.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands([]);
    }
  };

  const handleBrandRequest = async () => {
    if (!brandQuery.trim()) return;

    setIsLoading(true);
    try {
      await networkManager.request(
        "request/brand?name=" + brandQuery,
        "POST",
        null
      );
      alert("브랜드 요청이 완료되었습니다.");
      setShowBrandRequest(false);
    } catch (error) {
      console.error("브랜드 요청에 실패했습니다:", error);
      alert("브랜드 요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#1A1A1A] rounded-lg">
      {!hasFields.hasBrand && (
        <div>
          <h2 className="text-lg text-gray-400 font-bold mb-2">
            브랜드 검색하기
          </h2>
          <div className="relative">
            <input
              type="text"
              value={brandQuery}
              onChange={(e) => handleBrandSearch(e.target.value)}
              placeholder="브랜드 이름을 입력해주세요."
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />

            {filteredBrands.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredBrands.map((brand, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFields((prev) => ({
                        ...prev,
                        brand: brand.docId,
                      }));
                      onUpdate({ ...fields, brand: brand.docId });
                      setBrandQuery(brand.name.ko);
                      setFilteredBrands([]);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <>
                      {brand.name.ko}
                      <span className="text-gray-500 ml-2">
                        ({brand.name.en})
                      </span>
                    </>
                  </button>
                ))}
              </div>
            )}

            {brandQuery && filteredBrands.length === 0 && !showBrandRequest && (
              <button
                onClick={() => setShowBrandRequest(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                브랜드 추가
              </button>
            )}
          </div>

          {showBrandRequest && (
            <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border">
              <h4 className="font-medium mb-2">브랜드 추가 요청</h4>
              <p className="text-sm text-gray-400 mb-4">
                요청하신 브랜드는 검토 후 추가됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBrandRequest}
                  disabled={isLoading}
                  className={`px-4 py-2 text-black rounded ${
                    isLoading
                      ? "bg-blue-400"
                      : "bg-[#EAFD66] hover:bg-[#EAFD66]"
                  }`}
                >
                  {isLoading ? "요청 중..." : "요청하기"}
                </button>
                <button
                  onClick={() => setShowBrandRequest(false)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1A1A1A] rounded hover:bg-[#1A1A1A]"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-lg text-gray-400 font-bold mb-2">추가 정보 입력</h2>
        <div className="space-y-2">
          {!hasFields.hasName && (
            <input
              type="text"
              name="name"
              placeholder="아이템 이름"
              value={metadata?.product_name || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasBrand && (
            <input
              type="text"
              name="brand"
              placeholder="브랜드"
              value={fields.brand || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasDescription && (
            <input
              type="text"
              name="description"
              placeholder="아이템 설명"
              value={fields.description || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasMaterial && (
            <input
              type="text"
              name="material"
              placeholder="소재"
              value={metadata?.material || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasDesignedBy && (
            <input
              type="text"
              name="designedBy"
              placeholder="디자이너"
              value={fields.designedBy || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
          {!hasFields.hasColor && (
            <input
              type="text"
              name="color"
              placeholder="색상"
              value={fields.color || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#1A1A1A] border border-gray-800 rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalFieldsForm;
