import { useState, useEffect } from "react";
import { CategoryDoc, Category } from "@/types/model";

interface CategorySelectorProps {
  index: number;
  docs: CategoryDoc[];
  onCategorySelect: (index: number, path: string[]) => void;
}

export const CategorySelector = ({
  index,
  docs,
  onCategorySelect,
}: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [innerCategories, setInnerCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(docs);
  }, [docs]);

  const handleItemClassSelect = (itemClass: string) => {
    setSelectedPath([itemClass]);
    updateInnerCategories(itemClass);
  };

  const handleItemSubClassSelect = (itemSubClass: string) => {
    setSelectedPath([...(selectedPath?.slice(0, 1) || []), itemSubClass]);
  };

  const handleInnerCategorySelect = (
    depth: number,
    value: string,
    is_leaf: boolean
  ) => {
    const newPath = [...selectedPath?.slice(0, depth + 2), value];
    setSelectedPath(newPath);
    if (is_leaf) {
      onCategorySelect(index, newPath);
      setIsOpen(false);
    }
  };

  const updateInnerCategories = (itemClass: string) => {
    const selectedDoc = categories.find((cat) => cat.item_class === itemClass);
    if (selectedDoc?.inner) {
      setInnerCategories(selectedDoc.inner);
    } else {
      alert("Something wrong with category data");
    }
  };

  const getInnerCategories = (itemClass: string) => {
    const selectedDoc = categories.find((cat) => cat.item_class === itemClass);
    return selectedDoc?.inner || [];
  };

  const getChildCategories = (depth: number): Category[] | string[] => {
    let current: Category | undefined = innerCategories?.find(
      (cat) => cat.name === selectedPath?.[1]
    );

    for (let i = 2; i <= depth; i++) {
      current = (current?.children as Category[])?.find(
        (cat) => cat.name === selectedPath?.[i]
      );
    }
    if (current?.is_leaf) {
      return current.instances || [];
    }
    return (current?.children as Category[]) || [];
  };

  return (
    <div className="relative text-xs sm:text-sm">
      {/* 상단에 선택된 경로 표시 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-[#1A1A1A] rounded-lg cursor-pointer hover:bg-[#252525] transition-colors"
      >
        <span className="text-gray-400">
          {selectedPath.length > 0 ? selectedPath.join(" > ") : "카테고리 선택"}
        </span>
        <svg
          className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-lg">
          <div className="p-2 space-y-1">
            {/* 현재 depth에 따라 적절한 카테고리 목록 표시 */}
            {selectedPath.length === 0 &&
              // 메인 카테고리
              categories.map((cat) => (
                <div
                  key={cat.item_class}
                  onClick={() => handleItemClassSelect(cat.item_class)}
                  className="px-3 py-2 rounded cursor-pointer text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  {cat.item_class}
                </div>
              ))}

            {selectedPath.length === 1 &&
              // 서브 카테고리
              getInnerCategories(selectedPath[0]).map((category) => (
                <div
                  key={category.name}
                  onClick={() => handleItemSubClassSelect(category.name)}
                  className="px-3 py-2 rounded cursor-pointer text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  {category.name}
                </div>
              ))}

            {selectedPath.length > 1 &&
              // 하위 카테고리
              getChildCategories(selectedPath.length - 1).map((item) => (
                <div
                  key={typeof item === "string" ? item : item.name}
                  onClick={() =>
                    handleInnerCategorySelect(
                      selectedPath.length - 2,
                      typeof item === "string" ? item : item.name,
                      typeof item === "string" ? true : false
                    )
                  }
                  className="px-3 py-2 rounded cursor-pointer text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  {typeof item === "string" ? item : item.name}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
