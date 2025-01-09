import { useState } from "react";
import { ItemDocument, ProvideData } from "@/types/model";
import { networkManager } from "@/network/network";

interface ProvideModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDocId: string;
  item: ItemDocument;
}

export const ProvidePanel = ({
  isOpen,
  onClose,
  imageDocId,
  item,
}: ProvideModalProps) => {
  const [provideData, setProvideData] = useState<ProvideData | null>(null);
  const [activeTab, setActiveTab] = useState<"sale" | "reference">("sale");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const saleCount =
    item.linkInfo?.filter((link) => link.label === "sale").length || 0;
  const referenceCount =
    item.linkInfo?.filter((link) => link.label !== "sale").length || 0;
  const handleProvideClick = () => {
    setShowLinkForm(true);
  };
  const saleLinks =
    item.linkInfo?.filter((link) => link.label === "sale") || [];
  const referenceLinks =
    item.linkInfo?.filter((link) => link.label !== "sale") || [];

  const handleSubmit = async () => {
    if (!provideData) {
      alert("정보를 입력해주세요.");
      return;
    }
    const providerId = sessionStorage.getItem("USER_DOC_ID");

    provideData.provider = providerId || "";
    await networkManager
      .request(
        `image/${imageDocId}/provide/item/${item.Id}`,
        "POST",
        provideData
      )
      .then(() => {
        alert("제공 요청이 완료되었습니다.");
        onClose();
      })
      .catch((err) => {
        alert("제공 요청에 실패하였습니다.");
      });
  };

  const handleClose = () => {
    setProvideData(null);
    onClose();
  };

  return (
    <div
      className={`top-0 left-0 w-full h-full transform 
                    transition-transform duration-300 bg-[#111111] overflow-y-auto
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="max-w-[1400px] mx-auto p-6 h-auto flex flex-col">
        {/* 헤더 섹션 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleClose}
            className="flex items-center text-white"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* 아이템 정보 섹션 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-800 rounded-lg mb-4 overflow-hidden">
            {item.imgUrl ? (
              <img
                src={item.imgUrl}
                alt="Item"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <h2 className="text-xl font-medium text-white mb-2">
            {item.metadata.name || item.metadata.category}
          </h2>
          <button
            onClick={handleProvideClick}
            className="mt-4 px-4 py-2 bg-[#1A1A1A] text-[#EAFD66] rounded-full text-sm hover:bg-[#222222] transition-colors"
          >
            아이템 링크 제공
          </button>
        </div>

        {/* 링크 입력 폼 - 절대 위치로 오버레이 */}
        {showLinkForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#111111] p-6 rounded-lg w-full max-w-md space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">
                링크 제공하기
              </h3>
              <input
                type="url"
                placeholder="아이템과 관련된 링크를 입력하세요"
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg border border-white/5 
                        text-white placeholder-gray-500 focus:border-[#EAFD66] 
                        focus:ring-1 focus:ring-[#EAFD66] transition-colors outline-none
                        hover:border-white/10"
                onChange={(e) => {
                  const url = e.target.value;
                  setProvideData({
                    links: [url],
                  });
                }}
              />
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowLinkForm(false)}
                  className="flex-1 px-6 py-3 bg-[#1A1A1A] text-white rounded-lg font-medium
                            hover:bg-[#222222] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (provideData) {
                      handleSubmit();
                      setShowLinkForm(false);
                      setProvideData(null);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-[#EAFD66] text-black rounded-lg font-medium
                            hover:bg-[#d9ec55] transition-colors"
                >
                  제출하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 링크 타입 탭 */}
        <div className="relative">
          <div className="flex justify-center w-full border-b border-gray-800">
            <button
              onClick={() => setActiveTab("sale")}
              className={`flex items-center gap-2 py-4 px-6 relative w-full justify-center ${
                activeTab === "sale" ? "text-white" : "text-gray-500"
              }`}
            >
              <span>판매링크</span>
              <span
                className={
                  activeTab === "sale" ? "text-[#EAFD66]" : "text-gray-500"
                }
              >
                {saleCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reference")}
              className={`flex items-center gap-2 py-4 px-6 relative w-full justify-center ${
                activeTab === "reference" ? "text-white" : "text-gray-500"
              }`}
            >
              <span>관련 링크</span>
              <span>{referenceCount}</span>
            </button>
          </div>

          {/* 언더바 */}
          <div className="absolute bottom-0 left-0 w-full">
            <div
              className={`
                absolute h-[2px] bg-white transition-all duration-300 ease-in-out
                ${
                  activeTab === "sale"
                    ? "left-1/4 -translate-x-1/2 w-1/2"
                    : "left-3/4 -translate-x-1/2 w-1/2"
                }
              `}
            />
          </div>
        </div>

        <div>
          {activeTab === "sale" ? (
            <div className="space-y-2 p-4">
              {saleCount > 0 ? (
                saleLinks.map((link, index) => {
                  const url = new URL(link.url);
                  const domain = url.hostname.replace("www.", "");

                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-all hover:scale-[1.02] group"
                    >
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-[#EAFD66]">
                          {link.label.toUpperCase()}
                        </span>
                        <div className="text-sm font-medium text-zinc-300 group-hover:text-[#EAFD66] transition-colors">
                          {domain}
                        </div>
                        <div className="text-xs text-zinc-500">구매하기</div>
                      </div>
                      <svg
                        className="w-4 h-4 text-zinc-500 group-hover:text-[#EAFD66] transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  );
                })
              ) : (
                <EmptyLinkPage />
              )}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {referenceCount > 0 ? (
                <div className="space-y-6 p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
        ${
          activeFilter === "all"
            ? "bg-white/90 text-black"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700/80"
        }`}
                      onClick={() => setActiveFilter("all")}
                    >
                      All
                    </button>
                    {Array.from(
                      new Set(referenceLinks.map((link) => link.label))
                    ).map((label) => (
                      <button
                        key={label}
                        onClick={() => setActiveFilter(label)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
          ${
            activeFilter === label
              ? "bg-white/90 text-black"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700/80"
          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {referenceLinks.map((link, index) => {
                      const url = new URL(link.url);
                      const domain = url.hostname.replace("www.", "");

                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-all hover:scale-[1.02] group"
                        >
                          <div className="flex-1">
                            <span className="text-[10px] font-medium text-[#EAFD66]">
                              {link.label.toUpperCase()}
                            </span>
                            <div className="text-sm font-medium text-zinc-300 group-hover:text-[#EAFD66] transition-colors">
                              {domain}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="text-xs text-zinc-500">
                                자세히 보기
                              </div>
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-zinc-500 group-hover:text-[#EAFD66] transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyLinkPage />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyLinkPage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 min-h-[400px]">
      <div className="text-center space-y-4">
        {/* 아이콘 */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EAFD66]/10 mb-2">
          <svg
            className="w-6 h-6 text-[#EAFD66]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19"
            />
          </svg>
        </div>

        {/* 메인 텍스트 */}
        <div className="space-y-1.5">
          <p className="text-white/80 text-sm font-medium">
            아직 제공된 정보가 없어요
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            이 아이템의 첫 번째 정보 제공자가 되어보세요!
            <br />
            정확한 정보 제공 시
            <span className="text-[#EAFD66] ml-1">포인트가 지급</span>
            됩니다
          </p>
        </div>
      </div>
    </div>
  );
};
