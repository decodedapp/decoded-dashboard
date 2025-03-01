import Image from "next/image";
import { ImagePreviewModal } from "@/app/components/modal/image";
import { IdentitySelector } from "@/app/components/selector/identitySelector";
import { CategorySelector } from "@/app/components/selector/categorySelector";
import { CategoryDoc, IdentityDocument } from "@/types/model";

interface MobileViewProps {
  imageRequests: any[];
  categories: CategoryDoc[];
  identities: IdentityDocument[];
  openModalId: string | null;
  onOpenModal: (request: any) => void;
  onIdentitySelect: (index: number, identityId: string, request: any) => void;
  onCategorySelect: (index: number, path: string[]) => void;
  onUploadImage: (index: number) => void;
  onDeleteRequest: (requestId: string) => void;
  onCloseModal: () => void;
}

export const MobileView = ({
  imageRequests,
  categories,
  identities,
  openModalId,
  onOpenModal,
  onIdentitySelect,
  onCategorySelect,
  onUploadImage,
  onDeleteRequest,
  onCloseModal,
}: MobileViewProps) => {
  return (
    <div className="space-y-4">
      {imageRequests?.map((request, index) => (
        <div
          key={index}
          className="bg-[#222222] rounded-lg shadow overflow-hidden"
        >
          {/* 이미지 섹션 */}
          <div
            className="p-4 cursor-pointer"
            onClick={() => onOpenModal(request)}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={request.doc.imgUrl}
                alt={request.doc.title || "이미지"}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          {/* 컨트롤 섹션 */}
          <div className="p-4 space-y-4 border-t border-gray-800">
            {/* 아이덴티티 선택 */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase">
                아이덴티티
              </label>
              <IdentitySelector
                index={index}
                docs={identities}
                onIdentitySelect={onIdentitySelect}
              />
            </div>

            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase">
                카테고리
              </label>
              <CategorySelector
                index={index}
                docs={categories}
                onCategorySelect={onCategorySelect}
              />
            </div>

            {/* 작업 버튼 */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => onUploadImage(index)}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-[#EAFD66] transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-1.5 transition-colors duration-200 group-hover:text-[#EAFD66]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                업로드
              </button>
              <button
                onClick={() => onDeleteRequest(request.Id)}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-1.5 transition-colors duration-200 group-hover:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제
              </button>
            </div>
          </div>

          {/* 이미지 프리뷰 모달 */}
          <ImagePreviewModal
            isOpen={openModalId === request.Id}
            onClose={onCloseModal}
            request={{
              imgUrl: request.doc.imgUrl,
              title: request.doc.title,
              description: request.doc.description || "",
              style: request.doc.style || "",
              requestedItems: request.doc.requestedItems,
            }}
          />
        </div>
      ))}
    </div>
  );
};
