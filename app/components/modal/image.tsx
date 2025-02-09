import Image from "next/image";
import { useState, useEffect } from "react";
import {
  RequestedItem,
  CategoryDoc,
  Category,
  IdentityDocument,
} from "@/types/model";
import { networkManager } from "@/network/network";

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
    requestedItems: RequestedItem[];
  };
  onUpdate: (updatedDoc: {
    title: string;
    description: string;
    style: string;
    requestedItems: Record<string, RequestedItem[]>;
  }) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [innerCategories, setInnerCategories] = useState<
    Record<number, Category[]>
  >({});
  const [editedRequestedItems, setEditedRequestedItems] = useState(
    request.requestedItems
  );
  const [selectedPath, setSelectedPath] = useState<Record<number, string[]>>(
    {}
  );
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>(
    {}
  );
  const [identities, setIdentities] = useState<IdentityDocument[]>([]);
  const [identityCategories, setIdentityCategories] = useState<string[]>([]);
  const [selectedIdentities, setSelectedIdentities] = useState<{
    [index: number]: string;
  }>({});
  const [itemsWithIdentity, setItemsWithIdentity] = useState<
    Record<string, RequestedItem[]>
  >({});
  console.log("itemsWithIdentity", itemsWithIdentity);
  const [newIdentity, setNewIdentity] = useState({
    name: "",
    category: "",
    requestBy: "",
  });

  const handleDragStart = (e: React.MouseEvent, index: number) => {
    setIsDragging(true);

    const handleDrag = (e: MouseEvent) => {
      const imageElement = document.querySelector(
        ".relative.aspect-\\[3\\/4\\] img"
      );
      if (!imageElement) return;

      const rect = imageElement.getBoundingClientRect();
      const left = ((e.clientX - rect.left) / rect.width) * 100;
      const top = ((e.clientY - rect.top) / rect.height) * 100;

      const updatedItems = { ...editedRequestedItems };
      updatedItems[index] = {
        ...updatedItems[index],
        position: { left: left.toString(), top: top.toString() },
      };
      setEditedRequestedItems(updatedItems);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
    };

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleIdentitySelect = (
    index: number,
    identityId: string,
    item: RequestedItem
  ) => {
    setSelectedIdentities((prev) => ({
      ...prev,
      [index]: identityId,
    }));

    setItemsWithIdentity((prev) => ({
      ...prev,
      [identityId]: [...(prev[identityId] || []), item],
    }));
  };

  const handleItemClassSelect = (index: number, itemClass: string) => {
    setSelectedPath({
      ...selectedPath,
      [index]: [itemClass],
    });
    const identityId = selectedIdentities[index];
    if (!identityId) return;

    if (!itemClass) {
      // selectedPath 초기화
      setSelectedPath((prev) => ({
        ...prev,
        [index]: [],
      }));

      // itemsWithIdentity에서 해당 아이템 초기화
      setItemsWithIdentity((prev) => {
        const identityItems = [...(prev[identityId] || [])];
        identityItems[index] = {
          ...identityItems[index],
          itemClass: undefined,
          itemSubClass: undefined,
          category: undefined,
          subCategory: undefined,
          productType: undefined,
        };

        return {
          ...prev,
          [identityId]: identityItems,
        };
      });

      return;
    }

    setItemsWithIdentity((prev) => {
      const identityItems = [...(prev[identityId] || [])];
      identityItems[index] = {
        ...identityItems[index],
        itemClass,
      };

      return {
        ...prev,
        [identityId]: identityItems,
      };
    });
    updateInnerCategories(index, itemClass);
  };

  const handleItemSubClassSelect = (index: number, itemSubClass: string) => {
    setSelectedPath({
      ...selectedPath,
      [index]: [...(selectedPath[index]?.slice(0, 1) || []), itemSubClass],
    });
    const identityId = selectedIdentities[index];
    if (!identityId) return;

    if (!itemSubClass) {
      // selectedPath에서 itemClass만 남기고 나머지 초기화
      setSelectedPath((prev) => ({
        ...prev,
        [index]: prev[index]?.slice(0, 1) || [],
      }));

      // itemsWithIdentity에서 해당 아이템의 하위 카테고리들 초기화
      setItemsWithIdentity((prev) => {
        const identityItems = [...(prev[identityId] || [])];
        identityItems[index] = {
          ...identityItems[index],
          itemSubClass: undefined,
          category: undefined,
          subCategory: undefined,
          productType: undefined,
        };

        return {
          ...prev,
          [identityId]: identityItems,
        };
      });

      return;
    }

    setItemsWithIdentity((prev) => {
      const identityItems = [...(prev[identityId] || [])];
      identityItems[index] = {
        ...identityItems[index],
        itemSubClass,
      };

      return {
        ...prev,
        [identityId]: identityItems,
      };
    });
  };

  const handleInnerCategorySelect = (
    index: number,
    value: string,
    path: string[]
  ) => {
    const identityId = selectedIdentities[index];
    if (!identityId) return;

    const categoryPath = path.slice(2);

    setItemsWithIdentity((prev) => {
      const identityItems = [...(prev[identityId] || [])];

      switch (categoryPath.length) {
        case 1:
          identityItems[index] = {
            ...identityItems[index],
            productType: value,
          };
          break;

        case 2:
          identityItems[index] = {
            ...identityItems[index],
            category: categoryPath[0],
            productType: value,
          };
          break;

        case 3:
          identityItems[index] = {
            ...identityItems[index],
            category: categoryPath[0],
            subCategory: categoryPath[1],
            productType: value,
          };
          break;
      }

      return {
        ...prev,
        [identityId]: identityItems,
      };
    });
  };

  const isAllSelectionsComplete = () => {
    return Object.entries(itemsWithIdentity).every(([_, items]) =>
      items.every(
        (item) => item.itemClass && item.itemSubClass && item.productType
      )
    );
  };

  const updateInnerCategories = (index: number, itemClass: string) => {
    const selectedDoc = categories.find((cat) => cat.item_class === itemClass);
    setInnerCategories((prev) => ({
      ...prev,
      [index]: selectedDoc?.inner || [],
    }));
  };

  const getChildCategories = (
    index: number,
    depth: number
  ): Category[] | string[] => {
    let current: Category | undefined = innerCategories[index]?.find(
      (cat) => cat.name === selectedPath[index]?.[1]
    );

    for (let i = 2; i <= depth; i++) {
      current = (current?.children as Category[])?.find(
        (cat) => cat.name === selectedPath[index]?.[i]
      );
    }
    if (current?.is_leaf) {
      return current.instances || [];
    }
    return (current?.children as Category[]) || [];
  };

  const getFilteredIdentities = (index: number) => {
    const query = searchQueries[index] || "";
    return identities.filter((identity) =>
      identity.name.ko.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSearchChange = (index: number, query: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [index]: query,
    }));
  };

  const handleIdentityRequest = async (identity: {
    name: string;
    category: string;
  }) => {
    if (!identity.name || identity.category === "") {
      alert("모든 필드를 입력해주세요");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    const userDocId = sessionStorage.getItem("USER_DOC_ID");
    if (!userDocId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await networkManager.request(
        `admin/${userDocId}/identity/request`,
        "POST",
        {
          ...identity,
        },
        accessToken
      );
      alert("요청이 완료되었습니다.");
      setShowAddForm(false);
    } catch (error: any) {
      alert(
        error.response?.data?.description || "요청 중 오류가 발생했습니다."
      );
    }
  };

  const handleClose = () => {
    onClose();
    setShowAddForm(false);
    setSelectedPath({});
    setSelectedIdentities({});
    setItemsWithIdentity({});
  };

  const fetchCategories = async () => {
    const res = await networkManager.request("category/all", "GET", null);
    setCategories(res.data.item_classes);
  };

  const fetchIdentities = async () => {
    try {
      const res = await networkManager.request("identity", "GET", null);
      const identities = res.data.docs.map((identity: any) => ({
        name: identity.name,
        category: identity.category,
        id: identity._id,
        profileImageUrl: identity.profile_image_url,
      }));
      console.log(identities);
      setIdentities(identities);
    } catch (error) {
      console.error("Failed to fetch identities:", error);
    }
  };

  const fetchIdentityCategories = async () => {
    const res = await networkManager.request("identity/categories", "GET");
    setIdentityCategories(res.data);
  };

  const getInnerCategories = (itemClass: string) => {
    const selectedDoc = categories.find((cat) => cat.item_class === itemClass);
    return selectedDoc?.inner || [];
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchIdentities();
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="bg-[#1A1A1A] rounded-lg shadow-xl overflow-hidden w-full max-w-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-[#EAFD66]"
              >
                닫기
              </button>
            </div>

            {/* Image with markers */}
            <div className="relative aspect-[3/4] max-h-[500px] mb-6">
              <Image
                src={request.imgUrl}
                alt={request.title}
                fill
                className="object-cover rounded-lg"
              />
              {Object.values(editedRequestedItems || {}).map((item, index) => (
                <div
                  key={`${index}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-move ${
                    isDragging ? "pointer-events-none" : ""
                  }`}
                  style={{
                    left: `${item.position?.left}%`,
                    top: `${item.position?.top}%`,
                  }}
                  onMouseDown={(e) => handleDragStart(e, index)}
                >
                  <div className="w-4 h-4 bg-[#EAFD66] rounded-full flex items-center justify-center ring-2 ring-black/50 shadow-lg hover:bg-[#EAFD66] transition-colors">
                    <span className="text-xs text-black font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Items List */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">아이템 정보</h3>
              {Object.values(editedRequestedItems || {}).map((item, index) => (
                <div
                  key={`${index}`}
                  className="bg-[#1A1A1A] border border-gray-400 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-400">
                    <div className="w-8 h-8 bg-[#EAFD66] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <span className="text-[#EAFD66] font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-400">
                      아이템 {index + 1}
                    </h4>
                  </div>
                  {/* Subject */}
                  <div className="flex flex-col gap-2">
                    <div className="pt-4">
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="아이덴티티 검색"
                          className="w-full px-3 py-2 rounded-md text-gray-400 bg-[#1A1A1A]"
                          onChange={(e) =>
                            handleSearchChange(index, e.target.value)
                          }
                        />
                      </div>

                      {/* 아이덴티티 목록 */}
                      {searchQueries[index] && (
                        <div className="max-h-80 overflow-y-auto rounded-md border">
                          {getFilteredIdentities(index).length > 0 ? (
                            getFilteredIdentities(index).map((identity) => (
                              <div
                                key={identity.id}
                                onClick={() =>
                                  handleIdentitySelect(index, identity.id, item)
                                }
                                className={`
    flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-400 transition-colors duration-200
     ${
       itemsWithIdentity[identity.id]?.includes(item)
         ? "bg-[#EAFD66] border-l-4 border-[#EAFD66]"
         : ""
     } 
  `}
                              >
                                {/* 프로필 이미지 */}
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-400">
                                  {identity.profileImageUrl ? (
                                    <Image
                                      src={identity.profileImageUrl}
                                      alt={identity.name.ko}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500">
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
                                    {identity.name.ko}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-0.5">
                                    {identity.category}
                                  </div>
                                </div>

                                {/* 선택 표시 아이콘 */}
                                <div
                                  className={`
    flex-shrink-0 w-5 h-5 rounded-full ${
      itemsWithIdentity[identity.id]?.includes(item)
        ? "text-blue-500"
        : "text-gray-300"
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
                              {!showAddForm ? (
                                <button
                                  onClick={() => {
                                    setShowAddForm(true);
                                    fetchIdentityCategories();
                                  }}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  아티스트 추가 요청하기
                                </button>
                              ) : (
                                <div className="max-w-md mx-auto p-4 border rounded-lg">
                                  <h3 className="font-bold mb-3 text-gray-400">
                                    아이덴티티 추가
                                  </h3>
                                  <input
                                    type="text"
                                    placeholder="셀럽 이름"
                                    className="w-full p-2 border rounded mb-2 text-gray-400 bg-[#1A1A1A]"
                                    value={newIdentity.name}
                                    onChange={(e) =>
                                      setNewIdentity({
                                        ...newIdentity,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                  <select
                                    className="w-full p-2 border rounded mb-4 text-gray-400 bg-[#1A1A1A]"
                                    value={newIdentity.category}
                                    onChange={(e) =>
                                      setNewIdentity({
                                        ...newIdentity,
                                        category: e.target.value,
                                      })
                                    }
                                  >
                                    {identityCategories.map(
                                      (category, index) => (
                                        <option key={index} value={category}>
                                          {category}
                                        </option>
                                      )
                                    )}
                                  </select>
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setShowAddForm(false)}
                                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleIdentityRequest(newIdentity)
                                      }
                                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                                      disabled={!newIdentity.name}
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

                  {/* Categorization */}
                  <div className="flex flex-col gap-2">
                    {/* Identity가 선택된 경우에만 아이템 분류 표시 */}
                    {selectedIdentities[index] && (
                      <>
                        <div className="mt-4 space-y-4">
                          {/* 아이템 종류 선택 */}
                          <select
                            className="w-full p-2 rounded-md bg-[#1A1A1A] text-gray-400"
                            value={selectedPath[index]?.[0] ?? ""}
                            onChange={(e) =>
                              handleItemClassSelect(index, e.target.value)
                            }
                          >
                            <option value="">아이템 클래스 선택</option>
                            {categories.map((cat) => (
                              <option
                                key={cat.item_class}
                                value={cat.item_class}
                              >
                                {cat.item_class}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedPath[index]?.[0] && (
                          <select
                            className="w-full p-2 rounded-md bg-[#1A1A1A] text-gray-400"
                            value={selectedPath[index]?.[1] ?? ""}
                            onChange={(e) =>
                              handleItemSubClassSelect(index, e.target.value)
                            }
                          >
                            <option value="">카테고리 선택</option>
                            {getInnerCategories(selectedPath[index][0]).map(
                              (category) => (
                                <option
                                  key={category.name}
                                  value={category.name}
                                >
                                  {category.name}
                                </option>
                              )
                            )}
                          </select>
                        )}

                        {selectedPath[index]?.slice(1).map((_, depth) => {
                          const children = getChildCategories(index, depth + 1);
                          if (children.length === 0) return null;
                          return (
                            <select
                              key={depth}
                              className="w-full p-2 rounded-md bg-[#1A1A1A] text-gray-400"
                              value={selectedPath[index]?.[depth + 2] ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedPath({
                                  ...selectedPath,
                                  [index]: [
                                    ...selectedPath[index]?.slice(0, depth + 2),
                                    value,
                                  ],
                                });

                                if (typeof children[0] === "string") {
                                  handleInnerCategorySelect(index, value, [
                                    ...selectedPath[index]?.slice(0, depth + 2),
                                    value,
                                  ]);
                                }
                              }}
                            >
                              <option value="">하위 카테고리 선택</option>
                              {(children as (string | Category)[]).map(
                                (item) => (
                                  <option
                                    key={
                                      typeof item === "string"
                                        ? item
                                        : item.name
                                    }
                                    value={
                                      typeof item === "string"
                                        ? item
                                        : item.name
                                    }
                                  >
                                    {typeof item === "string"
                                      ? item
                                      : item.name}
                                  </option>
                                )
                              )}
                            </select>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800">
            <button
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                isAllSelectionsComplete()
                  ? "bg-[#EAFD66] hover:bg-[#EAFD66]/90 text-black"
                  : "bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => {
                if (isAllSelectionsComplete()) {
                  onUpdate({
                    title: request.title,
                    description: request.description,
                    style: request.style,
                    requestedItems: itemsWithIdentity,
                  });
                }
              }}
              disabled={!isAllSelectionsComplete()}
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
