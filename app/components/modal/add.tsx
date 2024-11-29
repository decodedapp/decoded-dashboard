import { useState, useEffect } from "react";
import {
  ImageDocument,
  ArtistDocument,
  Point,
  RequestedItem,
} from "@/types/model";
import {
  ItemClass,
  ItemSubClass,
  subClassesByClass,
  categoriesBySubClass,
} from "@/constants/categories";
import Image from "next/image";
import { networkManager } from "@/network/network";

interface AddItemModalProps {
  id: number;
  image: ImageDocument;
}

interface ExtendedPoint extends Point {
  artistId?: string;
}

export function AddItemModal({ id, image }: AddItemModalProps) {
  const [newMarkers, setNewMarkers] = useState<ExtendedPoint[]>([]);
  console.log("newMarkers", newMarkers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    itemClass: ItemClass;
    itemSubClass: ItemSubClass;
    category: string;
  } | null>(null);

  const [celebs, setCelebs] = useState<ArtistDocument[]>([]);
  const [newCeleb, setNewCeleb] = useState({
    name: "",
    category: "",
    requestBy: "",
  });

  useEffect(() => {
    const fetchCelebs = async () => {
      try {
        const res = await networkManager.request("artists", "GET", null);
        const artists = res.data.artists.map((celeb: any) => ({
          name: celeb.name,
          category: celeb.category,
          id: celeb._id,
          profileImageUrl: celeb.profile_image_url,
        }));
        setCelebs(artists);
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    };

    fetchCelebs();
  }, []);

  // 필터링된 셀럽 목록
  const filteredCelebs = celebs.filter((celeb) =>
    celeb.name.ko.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 새로운 셀럽 요청 핸들러
  const handleCelebRequest = async (celeb: {
    name: string;
    category: string;
    requestBy: string;
  }) => {
    const address = sessionStorage.getItem("USER_DOC_ID");
    if (!celeb.name || celeb.category === "") {
      alert("모든 필드를 입력해주세요");
      return;
    }
    if (address) {
      try {
        await networkManager.request("request/artist", "POST", {
          ...celeb,
          requestBy: address,
        });
        alert("요청이 완료되었습니다.");
        setShowAddForm(false);
      } catch (error: any) {
        alert(
          error.response?.data?.description || "요청 중 오류가 발생했습니다."
        );
      }
    } else {
      alert("로그인이 필요합니다");
    }
  };

  // 마커별 아티스트 선택 핸들러
  const handleArtistSelect = (markerId: number, artistId: string) => {
    setNewMarkers((prev) =>
      prev.map((marker, idx) =>
        idx === markerId ? { ...marker, artistId } : marker
      )
    );
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewMarkers((prev) => [...prev, { x, y }]);
  };

  const handleMarkerUpdate = (
    idx: number,
    type: "itemClass" | "itemSubClass" | "category",
    itemClass?: ItemClass,
    itemSubClass?: ItemSubClass,
    category?: string
  ) => {
    const updatedMarkers = [...newMarkers];
    if (type === "itemClass") {
      updatedMarkers[idx] = {
        ...updatedMarkers[idx],
        itemClass,
      };
    } else if (type === "itemSubClass") {
      updatedMarkers[idx] = {
        ...updatedMarkers[idx],
        itemSubClass,
      };
    } else {
      updatedMarkers[idx] = {
        ...updatedMarkers[idx],
        category,
      };
    }
    setNewMarkers(updatedMarkers);
  };

  const handleAdd = async (points: ExtendedPoint[]) => {
    console.log("Adding new items:", points);
    const items: Record<string, RequestedItem[]> = {};
    points.forEach((point) => {
      if (point.artistId) {
        if (!items[point.artistId]) {
          items[point.artistId] = [];
        }
        items[point.artistId].push({
          itemClass: point.itemClass!,
          itemSubClass: point.itemSubClass!,
          category: point.category!,
          position: {
            top: point.y.toString(),
            left: point.x.toString(),
          },
        });
      }
    });
    if (sessionStorage.getItem("USER_DOC_ID") === null) {
      alert("로그인이 필요합니다");
      return;
    }
    const requestAddItem = {
      requestBy: sessionStorage.getItem("USER_DOC_ID"),
      items,
    };
    console.log("requestAddItem", requestAddItem);
    console.log(image);
    networkManager
      .request(`request/add/item?id=${image.docId}`, "POST", requestAddItem)
      .then(() => {
        alert("요청이 완료되었습니다.");
        setNewMarkers([]);
        setShowAddForm(false);
      })
      .catch((error) => {
        alert(
          error.response?.data?.description || "요청중 오류가 발생했습니다."
        );
      });
  };

  const handleClose = () => {
    setNewMarkers([]);
    setShowAddForm(false);
    (
      document.getElementById(`add_item_modal_${id}`) as HTMLDialogElement
    )?.close();
  };

  return (
    <dialog
      id={`add_item_modal_${id}`}
      className="modal fixed inset-0 w-[800px] max-h-[95vh] p-0 bg-white rounded-2xl m-auto"
    >
      <div className="flex flex-col w-full h-full overflow-y-scroll">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">
            아이템 정보 요청
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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

        <div className="flex-1 p-8 space-y-6 w-full">
          {/* Image Area */}
          <ImageArea
            handleImageClick={handleImageClick}
            image={image}
            newMarkers={newMarkers}
          />
          {/* Selected Markers Area */}
          <SelectedMarkersArea
            newMarkers={newMarkers}
            newCeleb={newCeleb}
            handleMarkerUpdate={handleMarkerUpdate}
            handleArtistSelect={handleArtistSelect}
            setNewMarkers={setNewMarkers}
            setNewCeleb={setNewCeleb}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCelebs={filteredCelebs}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
          />
        </div>
        {/* Footer */}
        <RequestButton newMarkers={newMarkers} handleAdd={handleAdd} />
      </div>
    </dialog>
  );
}

const ImageArea = ({
  handleImageClick,
  image,
  newMarkers,
}: {
  handleImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  image: ImageDocument;
  newMarkers: Point[];
}) => {
  return (
    <div className="flex flex-col space-y-3">
      {/* 주의사항 */}
      <Caution />
      <div
        className="relative w-full overflow-hidden mx-auto"
        style={{
          aspectRatio: "3/4",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handleImageClick}
        >
          <Image
            src={image.imgUrl}
            alt="Fashion item"
            fill
            className="object-contain"
          />

          {/* 기존 마커들 */}
          {Object.values(image.items)
            .flat()
            .map((item, idx) => (
              <div
                key={idx}
                className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${item.position.top}%`,
                  left: `${item.position.left}%`,
                }}
              >
                <div className="absolute inset-0 border border-gray-400/30 rounded-full"></div>
                <div className="absolute inset-[3px] bg-gray-400/50 rounded-full backdrop-blur-sm"></div>
              </div>
            ))}

          {/* 새로운 마커들 */}
          {newMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${marker.y}%`,
                left: `${marker.x}%`,
              }}
            >
              <div className="absolute inset-0 border border-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-[3px] bg-yellow-400/70 rounded-full backdrop-blur-sm"></div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">
        이미지를 클릭하여 아이템 위치를 지정해주세요
      </p>
    </div>
  );
};

const Caution = () => {
  return (
    <div className="flex mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 w-[600px]">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            아이템 요청 시 주의사항
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">카테고리 선택 유의:</span> 잘못된
                카테고리 선택은 반려될 수 있으니 신중히 선택해 주세요.
              </li>
              <li>
                <span className="font-medium">포인트 차감 안내:</span> 각 요청
                건당 포인트가 차감되니 신중히 요청해 주세요.
              </li>
              <li>
                <span className="font-medium">중복 요청 제외:</span> 이미 요청된
                카테고리는 제외하고 요청해 주세요.
              </li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex items-center gap-1 text-yellow-800">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                신중한 요청이 더 나은 서비스로 이어집니다
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectedMarkersArea = ({
  newMarkers,
  newCeleb,
  handleMarkerUpdate,
  handleArtistSelect,
  setNewMarkers,
  setNewCeleb,
  searchQuery,
  setSearchQuery,
  filteredCelebs,
  showAddForm,
  setShowAddForm,
}: {
  newMarkers: ExtendedPoint[];
  newCeleb: {
    name: string;
    category: string;
    requestBy: string;
  };
  handleMarkerUpdate: (
    idx: number,
    type: "itemClass" | "itemSubClass" | "category",
    itemClass?: ItemClass,
    itemSubClass?: ItemSubClass,
    category?: string
  ) => void;
  handleArtistSelect: (markerId: number, artistId: string) => void;
  setNewMarkers: React.Dispatch<React.SetStateAction<Point[]>>;
  setNewCeleb: React.Dispatch<
    React.SetStateAction<{ name: string; category: string; requestBy: string }>
  >;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredCelebs: ArtistDocument[];
  showAddForm: boolean;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(false);

  const handleCelebRequest = (celeb: {
    name: string;
    category: string;
    requestBy: string;
  }) => {
    const address = sessionStorage.getItem("USER_DOC_ID");
    if (!celeb.name || celeb.category === "") {
      alert("Please fill in all fields");
      return;
    }
    if (address) {
      celeb.requestBy = address;
      setLoading(true);
      networkManager
        .request("request/artist", "POST", celeb)
        .then(() => {
          alert("요청이 완료되었습니다.");
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.description || "요청중 오류가 발생했습니다.";
          console.error("요청 실패:", errorMessage);
          alert(errorMessage);
        });
    } else {
      alert("Please login first");
    }
  };

  return (
    <>
      {newMarkers.map((marker, idx) => (
        <div
          key={idx}
          className="relative items-center justify-between p-4 bg-gray-50 rounded-lg max-w-[600px] mx-auto"
        >
          {/* Category Select Section  */}
          <div className="flex items-center justify-between mb-4">
            {/* 삭제 버튼 - 우측 상단에 절대 위치로 배치 */}
            <button
              onClick={() =>
                setNewMarkers((prev) => prev.filter((_, i) => i !== idx))
              }
              className="absolute top-2 right-2 p-1.5 rounded-full 
               hover:bg-gray-200 text-gray-400 hover:text-red-500 
               transition-colors duration-200 group"
              title="삭제"
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1 grid grid-cols-2 gap-3">
                {/* ItemClass 선택 */}
                <div>
                  <label className="text-xs text-gray-500">아이템 종류</label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {Object.keys(subClassesByClass).map((itemClass) => (
                      <button
                        key={itemClass}
                        onClick={() =>
                          handleMarkerUpdate(
                            idx,
                            "itemClass",
                            itemClass as ItemClass,
                            undefined,
                            undefined
                          )
                        }
                        className={`px-2 py-1 text-xs rounded ${
                          marker.itemClass === itemClass
                            ? "bg-black text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-black"
                        }`}
                      >
                        {itemClass}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category 선택 */}
                {marker.itemClass && (
                  <div>
                    <label className="text-xs text-gray-500">카테고리</label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {subClassesByClass[marker.itemClass as ItemClass].map(
                        (subClass) => (
                          <button
                            key={subClass}
                            onClick={() =>
                              handleMarkerUpdate(
                                idx,
                                "itemSubClass",
                                undefined,
                                subClass as ItemSubClass,
                                undefined
                              )
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              marker.itemSubClass === subClass
                                ? "bg-black text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-black"
                            }`}
                          >
                            {subClass}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Category 선택 */}
                {marker.itemSubClass && (
                  <div>
                    <label className="text-xs text-gray-500">카테고리</label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {categoriesBySubClass[
                        marker.itemSubClass as ItemSubClass
                      ].map((category) => (
                        <button
                          key={category}
                          onClick={() =>
                            handleMarkerUpdate(
                              idx,
                              "category",
                              undefined,
                              undefined,
                              category as string
                            )
                          }
                          className={`px-2 py-1 text-xs rounded ${
                            marker.category === category
                              ? "bg-black text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-black"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 아티스트 선택 */}
          <div className="border-t pt-4">
            <div className="mb-2">
              <label className="text-sm text-gray-500">아티스트 선택</label>
              <input
                type="text"
                placeholder="아티스트 검색..."
                className="w-full px-3 py-2 border rounded-md text-black"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 아티스트 목록 */}
            {searchQuery && (
              <div className="max-h-80 overflow-y-auto rounded-md border">
                {filteredCelebs.length > 0 ? (
                  filteredCelebs.map((celeb) => (
                    <div
                      key={celeb.id}
                      onClick={() => handleArtistSelect(idx, celeb.id)}
                      className={`
    flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200
     ${
       marker.artistId === celeb.id
         ? "bg-blue-50 border-l-4 border-blue-500"
         : ""
     } 
  `}
                    >
                      {/* 프로필 이미지 */}
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                        {celeb.profileImageUrl ? (
                          <Image
                            src={celeb.profileImageUrl}
                            alt={celeb.name.ko}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 아티스트 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {celeb.name.ko}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {celeb.category}
                        </div>
                      </div>

                      {/* 선택 표시 아이콘 */}
                      <div
                        className={`
    flex-shrink-0 w-5 h-5 rounded-full ${
      marker.artistId === celeb.id ? "text-blue-500" : "text-gray-300"
    }}
  `}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-gray-500 mb-2">
                      찾으시는 아티스트가 없나요?
                    </p>
                    {!showAddForm ? (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        아티스트 추가 요청하기
                      </button>
                    ) : (
                      <div className="max-w-md mx-auto p-4 border rounded-lg">
                        <h3 className="font-bold mb-3 text-black">
                          셀럽 추가 요청
                        </h3>
                        <input
                          type="text"
                          placeholder="셀럽 이름"
                          className="w-full p-2 border rounded mb-2 text-black"
                          value={newCeleb.name}
                          onChange={(e) =>
                            setNewCeleb({ ...newCeleb, name: e.target.value })
                          }
                        />
                        <select
                          className="w-full p-2 border rounded mb-4 text-black"
                          value={newCeleb.category}
                          onChange={(e) =>
                            setNewCeleb({
                              ...newCeleb,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="kpop">K-POP</option>
                          <option value="actor">배우</option>
                          <option value="athlete">운동선수</option>
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
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              </>
                            ) : (
                              <span>추가 요청하기</span>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          * 요청하신 셀럽 정보는 검토 후 24시간 이내에
                          반영됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

const RequestButton = ({
  newMarkers,
  handleAdd,
}: {
  newMarkers: ExtendedPoint[];
  handleAdd: (markers: ExtendedPoint[]) => void;
}) => {
  const isFilled = () => {
    for (const marker of newMarkers) {
      if (
        !marker.itemClass ||
        !marker.itemSubClass ||
        !marker.category ||
        !marker.artistId
      ) {
        return false;
      }
    }
    return true;
  };
  return (
    <div className="px-8 py-5 border-t border-gray-100">
      <div className="max-w-[600px] mx-auto">
        <button
          onClick={() => handleAdd(newMarkers)}
          disabled={!isFilled()}
          className={`
                w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                  isFilled()
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
        >
          요청하기 {newMarkers.length > 0 && `(${newMarkers.length})`}
        </button>
      </div>
    </div>
  );
};
