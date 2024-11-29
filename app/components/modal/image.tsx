import Image from "next/image";
import { useState, useRef } from "react";
import { RequestedItem } from "@/types/model";
import {
  ItemClass,
  ItemSubClass,
  subClassesByClass,
  categoriesBySubClass,
  styleOptions,
} from "@/constants/categories";
import { networkManager } from "@/network/network";

type FashionStyle = (typeof styleOptions)[number];

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  request,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: {
    title: string;
    description: string;
    style: string;
    imgUrl: string;
    requestedItems: Record<string, RequestedItem[]>;
    artist: {
      id: string;
      name: string;
    };
  };
  onUpdate: (updatedDoc: {
    title: string;
    description: string;
    style: string;
    requestedItems: Record<string, RequestedItem[]>;
    artist: string;
  }) => void;
}) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedArtist, setSelectedArtist] = useState({
    id: request.artist.id,
    name: request.artist.name,
  });
  const [selectedStyle, setSelectedStyle] = useState(request.style);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(request.title);
  const [editedDescription, setEditedDescription] = useState(
    request.description
  );
  const [editedRequestedItems, setEditedRequestedItems] = useState(
    request.requestedItems
  );
  const [selectedMarker, setSelectedMarker] = useState<{
    key: string;
    index: number;
  } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<
    "left" | "right" | "top" | "bottom"
  >("right");

  const fetchArtists = async () => {
    try {
      const res = await networkManager.request("artists", "GET", null);
      const formattedArtists = res.data.artists.map((celeb: any) => ({
        name: celeb.name.ko,
        id: celeb._id,
      }));
      setArtists(formattedArtists);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = async () => {
    await fetchArtists();
    setEditMode(true);
  };

  // 마커 클릭 시 팝오버 위치 계산
  const handleMarkerClick = (
    key: string,
    index: number,
    e: React.MouseEvent
  ) => {
    if (!editMode || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const markerX = e.clientX - rect.left;
    const markerY = e.clientY - rect.top;

    // 이미지의 오른쪽 절반에 있으면 왼쪽으로 팝오버
    if (markerX > rect.width / 2) {
      setPopoverPosition("left");
    } else {
      setPopoverPosition("right");
    }

    setSelectedMarker({ key, index });
  };

  const handleItemUpdate = (
    itemKey: string,
    index: number,
    updates: Partial<RequestedItem>
  ) => {
    setEditedRequestedItems((prev) => {
      const newItems = { ...prev };
      const itemArray = [...newItems[itemKey]];
      itemArray[index] = { ...itemArray[index], ...updates };
      newItems[itemKey] = itemArray;
      return newItems;
    });
  };

  const handleMarkerDrag = (
    itemKey: string,
    index: number,
    e: React.MouseEvent
  ) => {
    if (!imageRef.current || !editMode) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setEditedRequestedItems((prev) => {
      const newItems = { ...prev };
      const itemArray = [...newItems[itemKey]];
      itemArray[index] = {
        ...itemArray[index],
        position: {
          left: Math.min(100, Math.max(0, x)).toString(),
          top: Math.min(100, Math.max(0, y)).toString(),
        },
      };
      newItems[itemKey] = itemArray;
      return newItems;
    });
  };

  const handleSave = () => {
    setEditMode(false);
    const updatedRequestedItems: Record<string, RequestedItem[]> = {
      [selectedArtist.id]: Object.values(editedRequestedItems).flat(),
    };
    onUpdate({
      title: editedTitle,
      description: editedDescription,
      style: selectedStyle,
      requestedItems: updatedRequestedItems,
      artist: selectedArtist.name,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="relative inline-block overflow-hidden transform transition-all sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {request.title}
                  </h3>

                  <div className="relative aspect-[3/4] w-full" ref={imageRef}>
                    <Image
                      src={request.imgUrl}
                      alt={request.title}
                      fill
                      className="object-cover rounded"
                    />

                    {editedRequestedItems &&
                      Object.entries(editedRequestedItems).map(([key, items]) =>
                        items.map((item: any, index: number) => (
                          <div
                            key={`${key}-${index}`}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 group ${
                              editMode ? "cursor-move" : ""
                            }`}
                            style={{
                              left: `${item.position?.left}%`,
                              top: `${item.position?.top}%`,
                            }}
                            draggable={editMode}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", "");
                              e.currentTarget.classList.add("dragging");
                            }}
                            onDrag={(e) => {
                              if (e.clientX && e.clientY) {
                                handleMarkerDrag(key, index, e);
                              }
                            }}
                          >
                            <div className="relative">
                              {/* 외부 링 애니메이션 */}
                              <div className="absolute -inset-1 bg-white/30 rounded-full blur-sm group-hover:bg-white/40 transition-colors"></div>

                              {/* 메인 마커 */}
                              <div className="relative flex items-center">
                                <div
                                  className="w-4 h-4 bg-black rounded-full flex items-center justify-center ring-2 ring-white shadow-lg group-hover:scale-110 transition-transform"
                                  onClick={(e) =>
                                    handleMarkerClick(key, index, e)
                                  }
                                >
                                  <span className="text-[10px] text-white font-bold">
                                    {index + 1}
                                  </span>
                                </div>

                                {editMode &&
                                  selectedMarker?.key === key &&
                                  selectedMarker?.index === index && (
                                    <div
                                      className={`absolute z-50 ${
                                        popoverPosition === "left"
                                          ? "right-full mr-2"
                                          : "left-full ml-2"
                                      } bg-white rounded-lg shadow-xl p-2 min-w-[200px]`}
                                    >
                                      <div className="space-y-2">
                                        <div>
                                          <label className="text-xs text-gray-500">
                                            아이템 종류
                                          </label>
                                          <div className="grid grid-cols-2 gap-1 mt-1">
                                            {Object.keys(subClassesByClass).map(
                                              (itemClass) => (
                                                <button
                                                  key={itemClass}
                                                  onClick={() =>
                                                    handleItemUpdate(
                                                      key,
                                                      index,
                                                      {
                                                        itemClass:
                                                          itemClass as ItemClass,
                                                      }
                                                    )
                                                  }
                                                  className={`px-2 py-1 text-xs rounded ${
                                                    item.itemClass === itemClass
                                                      ? "bg-black text-white"
                                                      : "bg-gray-100 hover:bg-gray-200"
                                                  }`}
                                                >
                                                  {itemClass}
                                                </button>
                                              )
                                            )}
                                          </div>
                                        </div>

                                        {item.itemClass && (
                                          <div>
                                            <label className="text-xs text-gray-500">
                                              카테고리
                                            </label>
                                            <div className="grid grid-cols-2 gap-1 mt-1">
                                              {subClassesByClass[
                                                item.itemClass as ItemClass
                                              ].map((subClass) => (
                                                <button
                                                  key={subClass}
                                                  onClick={() =>
                                                    handleItemUpdate(
                                                      key,
                                                      index,
                                                      {
                                                        itemSubClass:
                                                          subClass as ItemSubClass,
                                                      }
                                                    )
                                                  }
                                                  className={`px-2 py-1 text-xs rounded ${
                                                    item.itemSubClass ===
                                                    subClass
                                                      ? "bg-black text-white"
                                                      : "bg-gray-100 hover:bg-gray-200"
                                                  }`}
                                                >
                                                  {subClass}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {item.itemSubClass && (
                                          <div>
                                            <label className="text-xs text-gray-500">
                                              카테고리
                                            </label>
                                            <div className="grid grid-cols-2 gap-1 mt-1">
                                              {categoriesBySubClass[
                                                item.itemSubClass as ItemSubClass
                                              ].map((category) => (
                                                <button
                                                  key={category}
                                                  onClick={() =>
                                                    handleItemUpdate(
                                                      key,
                                                      index,
                                                      {
                                                        category: category,
                                                      }
                                                    )
                                                  }
                                                  className={`px-2 py-1 text-xs rounded ${
                                                    item.category === category
                                                      ? "bg-black text-white"
                                                      : "bg-gray-100 hover:bg-gray-200"
                                                  }`}
                                                >
                                                  {category}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        <button
                                          onClick={() =>
                                            setSelectedMarker(null)
                                          }
                                          className="w-full mt-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                        >
                                          닫기
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                  </div>

                  <div className="bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl">
                    <div className="mb-6 border-b border-gray-200 pb-6">
                      <div className="flex items-center justify-between mb-4">
                        {editMode ? (
                          <div className="w-full space-y-4">
                            <div>
                              <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                제목
                              </label>
                              <input
                                type="text"
                                id="title"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                설명
                              </label>
                              <textarea
                                id="description"
                                value={editedDescription}
                                onChange={(e) =>
                                  setEditedDescription(e.target.value)
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="style"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                패션 스타일
                              </label>
                              <select
                                id="style"
                                value={selectedStyle}
                                onChange={(e) =>
                                  setSelectedStyle(
                                    e.target.value as FashionStyle
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                              >
                                {styleOptions.map((style) => (
                                  <option key={style} value={style}>
                                    {style}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                htmlFor="artist"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                아티스트
                              </label>
                              <select
                                id="artist"
                                value={selectedArtist.id}
                                onChange={(e) => {
                                  const artist = artists.find(
                                    (a) => a.id === e.target.value
                                  );
                                  if (artist) {
                                    setSelectedArtist({
                                      id: artist.id,
                                      name: artist.name,
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                              >
                                {artists.map((artist) => (
                                  <option key={artist.id} value={artist.id}>
                                    {artist.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditMode(false)}
                                className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                              >
                                취소
                              </button>
                              <button
                                onClick={handleSave}
                                className="px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800"
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {request.title}
                              </h3>
                              <button
                                onClick={handleEditClick}
                                className="text-sm text-gray-600 hover:text-black flex items-center space-x-1"
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
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                                <span>수정</span>
                              </button>
                            </div>
                            {request.description && (
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {request.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 아이템 리스트 */}
                    <div className="mt-4 space-y-2">
                      {request.requestedItems &&
                        Object.values(request.requestedItems)
                          .flat()
                          .map((item: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm text-gray-600"
                            >
                              <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xs">
                                {index + 1}
                              </span>
                              <span>
                                {item.itemClass} - {item.itemSubClass} -
                                {item.category}
                              </span>
                            </div>
                          ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
