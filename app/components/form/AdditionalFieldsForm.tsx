import React, { useState, useEffect } from "react";
import { networkManager } from "@/network/network";
import {
  HasFields,
  AdditionalMetadata,
  MetadataResponse,
  BrandDoc,
  UpdateItemMetadata,
} from "@/types/model";
import Image from "next/image";

const AdditionalFieldsForm = ({
  docs,
  hasFields,
  onUpdate,
  metadata,
}: {
  docs: BrandDoc[];
  hasFields: HasFields;
  onUpdate: (fields: UpdateItemMetadata) => void;
  metadata?: MetadataResponse;
}) => {
  const [fields, setFields] = useState<AdditionalMetadata>({});
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandRequest, setShowBrandRequest] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState<BrandDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandDoc[]>([]);
  useEffect(() => {
    setBrands(docs);
  }, [docs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFields = { ...fields, [name]: value };
    if (value === "") {
      delete updatedFields[name as keyof AdditionalMetadata];
    }
    setFields(updatedFields);
    onUpdate({
      additionalMetadata: updatedFields,
      base64Image: imagePreview?.split(",")[1],
    });
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
      alert("브랜드 추가 완료되었습니다.");
      setShowBrandRequest(false);
    } catch (error) {
      console.error("브랜드 추가에 실패했습니다:", error);
      alert("브랜드 추가에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#1A1A1A] rounded-lg">
      {!hasFields.hasImage && (
        <div className="mb-4">
          <h2 className="text-lg text-gray-400 font-bold mb-2">
            이미지 업로드
          </h2>
          <label className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#EAFD66] transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    const base64Data = base64.split(",")[1];
                    setImagePreview(base64);
                    onUpdate({
                      additionalMetadata: fields,
                      base64Image: base64Data,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
            <div className="relative aspect-video w-full h-[200px]">
              {" "}
              {/* 높이 지정 */}
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover rounded"
                  sizes="100%"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    className="w-8 h-8 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">클릭하여 이미지 업로드</span>
                </div>
              )}
            </div>
          </label>
        </div>
      )}
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
                      const updatedFields = {
                        ...fields,
                        brand: brand._id,
                      };
                      setFields(updatedFields);
                      onUpdate({
                        additionalMetadata: updatedFields,
                        base64Image: imagePreview?.split(",")[1],
                      });
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
              value={fields.name || ""}
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
              value={fields.material || ""}
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
