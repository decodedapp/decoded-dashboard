import Image from "next/image";
import { useState, useEffect } from "react";
import { ImageDocument, Point, RequestedItem } from "@/types/model";
import { networkManager } from "@/network/network";

interface AddItemModalProps {
  id: number;
  image: ImageDocument;
}

export function AddItemModal({ id, image }: AddItemModalProps) {
  const [newMarkers, setNewMarkers] = useState<Point[]>([]);

  useEffect(() => {
    const fetchCelebs = async () => {
      try {
        const res = await networkManager.request("identity", "GET", null);
        console.log("identity", res);
        const identities = res.data.docs.map((celeb: any) => ({
          name: celeb.name,
          category: celeb.category,
          id: celeb._id,
          profileImageUrl: celeb.profile_image_url,
        }));
      } catch (error) {
        console.error("Failed to fetch identities:", error);
      }
    };

    fetchCelebs();
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewMarkers((prev) => [...prev, { x, y }]);
  };

  const handleAdd = async (points: Point[]) => {
    const items: RequestedItem[] = [];
    points.forEach((point) => {
      items.push({
        position: {
          top: point.y.toString(),
          left: point.x.toString(),
        },
      });
    });
    const requestAddItem = {
      requestBy: sessionStorage.getItem("USER_DOC_ID"),
      items,
    };
    console.log("requestAddItem", requestAddItem);
    console.log(image);
    networkManager
      .request(`image/${image.docId}/request/add`, "POST", requestAddItem)
      .then(() => {
        alert("요청이 완료되었습니다.");
        setNewMarkers([]);
      })
      .catch((error) => {
        alert(
          error.response?.data?.description || "요청중 오류가 발생했습니다."
        );
      });
  };

  const handleClose = () => {
    setNewMarkers([]);
    (
      document.getElementById(`add_item_modal_${id}`) as HTMLDialogElement
    )?.close();
  };

  return (
    <dialog
      id={`add_item_modal_${id}`}
      className="modal fixed inset-0 w-[800px] max-h-[95vh] p-0 bg-[#1A1A1A] rounded-2xl m-auto"
    >
      <div className="flex flex-col w-full h-full overflow-y-scroll">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5">
          <h2 className="text-lg font-medium text-gray-400">
            아이템 정보 요청
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-400 transition-colors"
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
            setNewMarkers={setNewMarkers}
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
    <div className="flex mx-auto bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6 w-[600px]">
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
  setNewMarkers,
}: {
  newMarkers: Point[];
  setNewMarkers: React.Dispatch<React.SetStateAction<Point[]>>;
}) => {
  return (
    <>
      {newMarkers.map((marker, idx) => (
        <div
          key={idx}
          className="relative items-center justify-between p-4 bg-gray-50 rounded-lg max-w-[600px] mx-auto"
        >
          <div
            className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center 
            bg-blue-500 text-white rounded-full font-medium text-sm"
          >
            {idx + 1}
          </div>

          {/* Category Select Section  */}
          <div className="flex items-center justify-between mb-4">
            {/* Delete Button  */}
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
  newMarkers: Point[];
  handleAdd: (markers: Point[]) => void;
}) => {
  return (
    <div className="px-8 py-5">
      <div className="max-w-[600px] mx-auto">
        <button
          onClick={() => handleAdd(newMarkers)}
          className={`
                w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
bg-gray-400/10 text-gray-400 hover:bg-[#EAFD66]
              `}
        >
          요청하기 {newMarkers.length > 0 && `(${newMarkers.length})`}
        </button>
      </div>
    </div>
  );
};
