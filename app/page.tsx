"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { networkManager } from "@/network/network";
import AdminLogin from "./components/login";

type TabType = "requests" | "artists" | "brands";

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>("requests");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const tabs = [
    { id: "requests", name: "요청/제공 관리" },
    { id: "artists", name: "아티스트 요청" },
    { id: "brands", name: "브랜드 요청" },
  ] as const;

  const handleLogin = () => {
    setIsAdmin(true);
    localStorage.setItem("isAdmin", "true");
  };

  // Checking admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedAdminStatus = localStorage.getItem("isAdmin");
      if (storedAdminStatus === "true") {
        setIsAdmin(true);
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">관리자 로그인</h2>
            <p className="mt-2 text-sm text-gray-600">
              계속하려면 관리자 계정으로 로그인해주세요
            </p>
          </div>

          <AdminLogin onLogin={handleLogin} />

          <div className="text-center text-sm text-gray-500">
            <p>관리자 권한이 필요한 페이지입니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              관리자 대시보드
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    currentTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {currentTab === "requests" && <RequestProvideSection />}
        {currentTab === "artists" && <ArtistRequestSection />}
        {currentTab === "brands" && <BrandRequestSection />}
      </div>
    </div>
  );
}

const RequestProvideSection = () => {
  const [selectedTab, setSelectedTab] = useState("request");
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-2">
          <button
            className={`
          py-4 text-center text-sm font-medium transition-all duration-200
          ${
            selectedTab === "request"
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-50"
          }
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black
        `}
            onClick={() => setSelectedTab("request")}
          >
            <div className="flex items-center justify-center space-x-2">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Request</span>
            </div>
          </button>
          <button
            className={`
          py-4 text-center text-sm font-medium transition-all duration-200
          ${
            selectedTab === "provide"
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-50"
          }
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black
        `}
            onClick={() => setSelectedTab("provide")}
          >
            <div className="flex items-center justify-center space-x-2">
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
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              <span>Provide</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <div
          className={`
      bg-white rounded-lg shadow
      ${selectedTab === "request" ? "block" : "hidden"}
    `}
        >
          <RequestListSection />
        </div>
        <div
          className={`
      bg-white rounded-lg shadow
      ${selectedTab === "provide" ? "block" : "hidden"}
    `}
        >
          {/* Provide Section Content */}
        </div>
      </div>
    </div>
  );
};

const ArtistRequestSection = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold mb-4">아티스트 요청 목록</h2>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                아티스트명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 아티스트 요청 목록 데이터 매핑 */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BrandRequestSection = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold mb-4">브랜드 요청 목록</h2>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                브랜드명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 브랜드 요청 목록 데이터 매핑 */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type ItemClass = "Fashion" | "Furniture" | "Art";
type ItemCategory =
  | "Clothing"
  | "Accessories"
  | "Sneakers"
  | "Chair"
  | "Table"
  | "Lighting"
  | "Painting"
  | "Sculpture"
  | "Photography";

interface Point {
  x: number;
  y: number;
  itemClass?: ItemClass;
  category?: ItemCategory;
}

const categoryByClass: Record<ItemClass, ItemCategory[]> = {
  Fashion: ["Clothing", "Accessories", "Sneakers"],
  Furniture: ["Chair", "Table", "Lighting"],
  Art: ["Painting", "Sculpture", "Photography"],
};

function RequestListSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  // State of navigation
  const [isStepComplete, setIsStepComplete] = useState(false);
  // State of step1
  const [selectedCeleb, setSelectedCeleb] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // State of step2
  const [imageFile, setImageFile] = useState<File | null>(null);
  // State of step2
  const [context, setContext] = useState("");
  // State of step3
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setIsStepComplete(!!selectedCeleb);
        break;
      case 2:
        setIsStepComplete(!!selectedImage);
        break;
      case 3:
        // 모든 포인트가 itemClass와 category를 가지고 있는지 확인
        setIsStepComplete(
          points.length > 0 &&
            points.every((point) => point.itemClass && point.category)
        );
        break;
      default:
        setIsStepComplete(false);
    }
  }, [currentStep, selectedCeleb, selectedImage, points]);

  // TODO: Submit to backend
  const handleSubmit = () => {
    console.log(points);
  };

  // Next Button Component
  const NextButton = () => (
    <button
      onClick={() => setCurrentStep((prev) => prev + 1)}
      disabled={!isStepComplete}
      className={`
        px-6 py-2 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          isStepComplete
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
      `}
    >
      다음
    </button>
  );

  // Previous Button Component
  const PrevButton = () => (
    <button
      onClick={() => setCurrentStep((prev) => prev - 1)}
      className="px-6 py-2 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
    >
      이전
    </button>
  );

  const StepIndicator = () => (
    <div className="w-full mb-20">
      <div className="relative pt-1">
        <div className="absolute top-5 w-full">
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-yellow-400 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="relative">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  currentStep > index + 1
                    ? "bg-black text-white"
                    : currentStep === index + 1
                    ? "bg-yellow-400"
                    : "bg-gray-200"
                }
              `}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Step1 = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCeleb, setNewCeleb] = useState({ name: "", category: "KPOP" });
    const [celebs, setCelebs] = useState<{ name: string; category: string }[]>(
      []
    );
    useEffect(() => {
      // TODO: Fetch from an API or database
    }, []);

    const filteredCelebs = celebs.filter((celeb) =>
      celeb.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCelebRequest = (celeb: { name: string; category: string }) => {
      // TODO: Submit to backend
    };

    return (
      <div className="relative min-h-screen space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          어떤 셀럽의 아이템을 찾고 계신가요?
        </h2>

        <div className="max-w-md mx-auto">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="셀럽 이름을 검색해주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Result */}
          {searchQuery && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredCelebs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredCelebs.map((celeb, index) => (
                    <div
                      key={index}
                      className={`p-4 cursor-pointer transition-colors
                        ${
                          selectedCeleb === celeb.name
                            ? "bg-yellow-50"
                            : "hover:bg-gray-50"
                        }`}
                      onClick={() => setSelectedCeleb(celeb.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {celeb.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {celeb.category}
                          </p>
                        </div>
                        {selectedCeleb === celeb.name && (
                          <svg
                            className="h-5 w-5 text-yellow-400"
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-500 mb-4">
                    찾으시는 셀럽이 목록에 없나요?
                  </p>
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      셀럽 추가 요청하기
                    </button>
                  ) : (
                    <div className="max-w-md mx-auto p-4 border rounded-lg">
                      <h3 className="font-bold mb-3">셀럽 추가 요청</h3>
                      <input
                        type="text"
                        placeholder="셀럽 이름"
                        className="w-full p-2 border rounded mb-2"
                        value={newCeleb.name}
                        onChange={(e) =>
                          setNewCeleb({ ...newCeleb, name: e.target.value })
                        }
                      />
                      <select
                        className="w-full p-2 border rounded mb-4"
                        value={newCeleb.category}
                        onChange={(e) =>
                          setNewCeleb({ ...newCeleb, category: e.target.value })
                        }
                      >
                        <option value="KPOP">K-POP</option>
                        <option value="ACTOR">배우</option>
                        <option value="ATHLETE">운동선수</option>
                      </select>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleCelebRequest(newCeleb)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                          disabled={!newCeleb.name}
                        >
                          추가 요청하기
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        * 요청하신 셀럽 정보는 검토 후 24시간 이내에 반영됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected Celeb Display */}
          {selectedCeleb && !searchQuery && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedCeleb}</p>
                  <p className="text-sm text-gray-500">선택됨</p>
                </div>
                <button
                  onClick={() => setSelectedCeleb(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
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
            </div>
          )}
        </div>
      </div>
    );
  };

  const Step2 = () => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files[0]);
      }
    };

    const handleFiles = (file: File) => {
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file);
      setSelectedImage(fileUrl);
    };

    return (
      <div className="space-y-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">
            {selectedCeleb}의 사진을 업로드해주세요
          </h2>
          <p className="text-gray-500">
            아이템 식별에 도움이 될 만한 선명한 사진을 올려주세요
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {!selectedImage ? (
            <div
              className={`
                relative 
                aspect-[3/4]
                rounded-lg 
                border-2 
                border-dashed 
                transition-all
                ${
                  dragActive
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFiles(e.target.files[0]);
                  }
                }}
                accept="image/*"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4">
                  <svg
                    className={`w-12 h-12 mb-3 ${
                      dragActive ? "text-yellow-400" : "text-gray-400"
                    }`}
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
                </div>

                <p
                  className={`mb-2 text-lg ${
                    dragActive ? "text-yellow-600" : "text-gray-600"
                  }`}
                >
                  {dragActive
                    ? "여기에 놓아주세요!"
                    : "이미지를 드래그하여 업로드하거나"}
                </p>

                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  컴퓨터에서 선택
                </button>

                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, GIF (최대 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Selected preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <svg
                    className="w-5 h-5 text-white"
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

              {/* Context Information Input Section */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    컨텍스트 정보
                  </label>
                  <textarea
                    placeholder="예: 인천공항 출국길, 2024 SS 패션위크, 신곡 뮤직비디오 등"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>모르는 경우 건너뛰기 가능</span>
                  <span className="text-right">{context.length}/200자</span>
                </div>

                {/* Preview of Input Information */}
                {context && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{context}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  업로드 팁
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>선명하고 깨끗한 사진일수록 아이템 식별이 쉬워요</li>
                    <li>가능한 전신 사진을 올려주시면 좋아요</li>
                    <li>컨텍스트 정보는 아이템을 찾는데 큰 도움이 됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Step3 = () => {
    const imageRef = useRef<HTMLDivElement>(null);

    const handleImageClick = (e: React.MouseEvent) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPoints([...points, { x, y }]);
    };

    const removePoint = (index: number) => {
      setPoints(points.filter((_, i) => i !== index));
    };

    const updatePointClass = (index: number, itemClass: ItemClass) => {
      setPoints(
        points.map((point, i) =>
          i === index ? { ...point, itemClass, category: undefined } : point
        )
      );
    };

    const updatePointCategory = (index: number, category: ItemCategory) => {
      setPoints(
        points.map((point, i) => (i === index ? { ...point, category } : point))
      );
    };

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          궁금한 아이템을 선택해주세요
        </h2>

        <div className="max-w-2xl mx-auto space-y-2 text-gray-600">
          <p className="text-sm">
            이미지를 클릭하여 궁금한 아이템의 위치를 표시해주세요
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="font-medium text-gray-900">필수 입력사항</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">아이템 선택</p>
                  <p className="text-gray-600">
                    최소 1개 이상의 아이템을 선택해주세요
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">아이템 종류</p>
                  <p className="text-gray-600">
                    Fashion, Furniture, Art 중 선택
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">상세 카테고리</p>
                  <p className="text-gray-600">
                    선택한 종류에 따른 세부 카테고리 선택
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p className="font-medium">주의사항</p>
            <ul className="mt-1 text-xs space-y-1 list-disc list-inside">
              <li>최소 1개 이상의 아이템을 선택해야 합니다</li>
              <li>
                모든 선택한 아이템에 대해 종류와 카테고리를 지정해야 합니다
              </li>
              <li>위 조건이 모두 충족되어야 다음 단계로 진행할 수 있습니다</li>
            </ul>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {selectedImage && (
            <div
              ref={imageRef}
              className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-crosshair"
              onClick={handleImageClick}
            >
              <Image
                src={selectedImage}
                alt="Selected preview"
                fill
                className="object-cover"
              />

              {points.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-6 h-6 -ml-3 -mt-3 group"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <div className="relative">
                    <div className="absolute w-6 h-6 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
                    <div
                      className={`
                      relative w-6 h-6 rounded-full flex items-center justify-center
                      ${
                        point.itemClass && point.category
                          ? "bg-green-400"
                          : "bg-yellow-400"
                      }
                    `}
                    >
                      <span className="text-xs text-white font-bold">
                        {index + 1}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePoint(index);
                      }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white 
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Point List */}
          {points.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-gray-900">선택한 아이템</h3>
              <div className="space-y-4">
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`
                          w-5 h-5 rounded-full flex items-center justify-center
                          ${
                            point.itemClass && point.category
                              ? "bg-green-400"
                              : "bg-yellow-400"
                          }
                        `}
                        >
                          <span className="text-xs text-white font-bold">
                            {index + 1}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          아이템 {index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removePoint(index)}
                        className="text-gray-400 hover:text-red-500"
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

                    {/* Class Selection */}
                    <div className="flex gap-2">
                      {(["Fashion", "Furniture", "Art"] as ItemClass[]).map(
                        (itemClass) => (
                          <button
                            key={itemClass}
                            onClick={() => updatePointClass(index, itemClass)}
                            className={`
                            px-3 py-1.5 rounded-full text-sm
                            ${
                              point.itemClass === itemClass
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }
                          `}
                          >
                            {itemClass}
                          </button>
                        )
                      )}
                    </div>

                    {/* Category Selection */}
                    {point.itemClass && (
                      <div className="flex gap-2 flex-wrap">
                        {categoryByClass[point.itemClass].map((category) => (
                          <button
                            key={category}
                            onClick={() => updatePointCategory(index, category)}
                            className={`
                              px-3 py-1.5 rounded-full text-sm
                              ${
                                point.category === category
                                  ? "bg-yellow-400 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }
                            `}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {points.length === 0 && (
            <div className="mt-6 text-center text-gray-500">
              이미지를 클릭하여 궁금한 아이템을 선택해주세요
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <StepIndicator />
        <div className="mt-8">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between">
          <div>{currentStep > 1 && <PrevButton />}</div>
          <div>
            {currentStep < totalSteps && <NextButton />}
            {currentStep === totalSteps && (
              <button
                onClick={handleSubmit}
                disabled={!isStepComplete}
                className={`
                  px-6 py-2 rounded-md text-sm font-medium
                  transition-all duration-200
                  ${
                    isStepComplete
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
