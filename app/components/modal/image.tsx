import Image from "next/image";
import { useState, useEffect } from "react";
import { RequestedItem, CategoryDoc, Category } from "@/types/model";
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [innerCategories, setInnerCategories] = useState<
    Record<number, Category[]>
  >({});
  const [editedRequestedItems, setEditedRequestedItems] = useState(
    request.requestedItems
  );
  console.log("editedRequestedItems", editedRequestedItems);
  const [selectedPath, setSelectedPath] = useState<Record<number, string[]>>(
    {}
  );
  console.log("selectedPath", selectedPath);

  const handleDragStart = (e: React.MouseEvent, key: string, index: number) => {
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
      updatedItems[key][index] = {
        ...updatedItems[key][index],
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

  const handleItemUpdate = (
    key: string,
    index: number,
    updates: Partial<RequestedItem>
  ) => {
    const updatedItems = { ...editedRequestedItems };
    updatedItems[key][index] = {
      ...updatedItems[key][index],
      ...updates,
    };
    setEditedRequestedItems(updatedItems);
    onUpdate({
      ...request,
      requestedItems: updatedItems,
      artist: request.artist.id,
    });
  };

  const handleItemClassSelect = (
    key: string,
    index: number,
    itemClass: string
  ) => {
    setSelectedPath({
      ...selectedPath,
      [index]: [itemClass],
    });
    const updatedItems = { ...editedRequestedItems };
    updatedItems[key][index] = {
      ...updatedItems[key][index],
      itemClass,
    };
    setEditedRequestedItems(updatedItems);
    updateInnerCategories(index, itemClass);
  };

  const handleItemSubClassSelect = (
    key: string,
    index: number,
    itemSubClass: string
  ) => {
    setSelectedPath({
      ...selectedPath,
      [index]: [...(selectedPath[index]?.slice(0, 1) || []), itemSubClass],
    });
    const updatedItems = { ...editedRequestedItems };
    updatedItems[key][index] = {
      ...updatedItems[key][index],
      itemSubClass,
    };
    setEditedRequestedItems(updatedItems);
  };

  const handleInnerCategorySelect = (
    key: string,
    index: number,
    value: string,
    path: string[]
  ) => {
    const updatedItems = { ...editedRequestedItems };
    const categoryPath = path.slice(2);

    switch (categoryPath.length) {
      case 1:
        updatedItems[key][index] = {
          ...updatedItems[key][index],
          productType: value,
        };
        break;

      case 2:
        updatedItems[key][index] = {
          ...updatedItems[key][index],
          category: categoryPath[0],
          productType: value,
        };
        break;

      case 3:
        updatedItems[key][index] = {
          ...updatedItems[key][index],
          category: categoryPath[0],
          subCategory: categoryPath[1],
          productType: value,
        };
        break;
    }

    setEditedRequestedItems(updatedItems);
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

  const fetchCategories = async () => {
    const res = await networkManager.request("categories", "GET", null);
    setCategories(res.data.item_classes);
  };

  const getInnerCategories = (itemClass: string) => {
    const selectedDoc = categories.find((cat) => cat.item_class === itemClass);
    return selectedDoc?.inner || [];
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {request.title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>

            {/* Image with markers */}
            <div className="relative aspect-[3/4] mb-6">
              <Image
                src={request.imgUrl}
                alt={request.title}
                fill
                className="object-cover rounded-lg"
              />
              {Object.entries(editedRequestedItems).map(([key, items]) =>
                items.map((item, index) => (
                  <div
                    key={`${key}-${index}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-move ${
                      isDragging ? "pointer-events-none" : ""
                    }`}
                    style={{
                      left: `${item.position?.left}%`,
                      top: `${item.position?.top}%`,
                    }}
                    onMouseDown={(e) => handleDragStart(e, key, index)}
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg hover:bg-blue-600 transition-colors">
                      <span className="text-xs text-white font-bold">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Items List */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">아이템 정보</h3>
              {Object.entries(editedRequestedItems).map(([key, items]) =>
                items.map((item, index) => (
                  <div
                    key={`${key}-${index}`}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                      <div className="w-8 h-8 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">
                        아이템 {index + 1}
                      </h4>
                    </div>

                    <div className="mt-4 space-y-4">
                      {/* 아이템 종류 선택 */}
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={selectedPath[index]?.[0] ?? ""}
                        onChange={(e) =>
                          handleItemClassSelect(key, index, e.target.value)
                        }
                      >
                        <option value="">아이템 클래스 선택</option>
                        {categories.map((cat) => (
                          <option key={cat.item_class} value={cat.item_class}>
                            {cat.item_class}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedPath[index]?.[0] && (
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={selectedPath[index]?.[1] ?? ""}
                        onChange={(e) =>
                          handleItemSubClassSelect(key, index, e.target.value)
                        }
                      >
                        <option value="">카테고리 선택</option>
                        {getInnerCategories(selectedPath[index][0]).map(
                          (category) => (
                            <option key={category.name} value={category.name}>
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
                          className="w-full p-2 border border-gray-300 rounded-md"
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

                            // children이 string[]인 경우 (leaf node)
                            if (typeof children[0] === "string") {
                              handleInnerCategorySelect(key, index, value, [
                                ...selectedPath[index]?.slice(0, depth + 2),
                                value,
                              ]);
                            }
                          }}
                        >
                          <option value="">하위 카테고리 선택</option>
                          {(children as (string | Category)[]).map((item) => (
                            <option
                              key={typeof item === "string" ? item : item.name}
                              value={
                                typeof item === "string" ? item : item.name
                              }
                            >
                              {typeof item === "string" ? item : item.name}
                            </option>
                          ))}
                        </select>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
