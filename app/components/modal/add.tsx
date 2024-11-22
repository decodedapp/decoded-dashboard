import { useState } from "react";
import { ItemClass, Position } from "@/types/model";
import { categoryByClass } from "@/constants/categories";

interface AddItemModalProps {
  position: Position;
  onClose: () => void;
  onAdd: (itemClass: ItemClass, category: string) => void;
}

export function AddItemModal({ position, onClose, onAdd }: AddItemModalProps) {
  const [selectedItemClass, setSelectedItemClass] = useState<ItemClass | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAdd = () => {
    if (!selectedItemClass || !selectedCategory) return;
    onAdd(selectedItemClass, selectedCategory);
    onClose();
  };

  return (
    <div
      className="absolute z-20 w-[280px] bg-black/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10"
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-sm font-medium">새 아이템 추가</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 아이템 클래스 선택 */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400">아이템 종류</label>
          <div className="flex gap-2">
            {(["Fashion", "Furniture", "Art"] as ItemClass[]).map(
              (itemClass) => (
                <button
                  key={itemClass}
                  onClick={() => setSelectedItemClass(itemClass)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${
                      selectedItemClass === itemClass
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }
                  `}
                >
                  {itemClass}
                </button>
              )
            )}
          </div>
        </div>

        {/* 카테고리 선택 */}
        {selectedItemClass && (
          <div className="space-y-2">
            <label className="text-xs text-gray-400">카테고리</label>
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
              {categoryByClass[selectedItemClass].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                      px-3 py-1.5 rounded-full text-xs font-medium
                      transition-all duration-200
                      ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }
                    `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 확인 버튼 */}
        <button
          onClick={handleAdd}
          disabled={!selectedItemClass || !selectedCategory}
          className={`
              w-full py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                selectedItemClass && selectedCategory
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 cursor-not-allowed"
              }
            `}
        >
          추가하기
        </button>
      </div>
    </div>
  );
}
