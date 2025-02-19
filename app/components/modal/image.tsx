import Image from "next/image";
import { useState, useEffect } from "react";
import { RequestedItem } from "@/types/model";

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  request,
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
}) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg relative border border-gray-800">
          {/* Header */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors group"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#EAFD66]"
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

          {/* Image with markers */}
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={request.imgUrl}
              alt={request.title}
              fill
              className="object-cover"
              quality={100}
            />
            {/* Markers with animation */}
            {Object.values(request.requestedItems || {}).map((item, index) => (
              <div
                key={`${index}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${item.position?.left}%`,
                  top: `${item.position?.top}%`,
                }}
              >
                <div className="relative">
                  <div className="w-5 h-5 bg-[#EAFD66] rounded-full flex items-center justify-center ring-4 ring-black/30 shadow-lg animate-pulse">
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                  {/* Ripple effect */}
                  <div className="absolute inset-0 bg-[#EAFD66]/30 rounded-full animate-ping" />
                </div>
              </div>
            ))}
          </div>

          {/* Optional: Image info */}
          {(request.title || request.description) && (
            <div className="p-4 border-t border-gray-800">
              {request.title && (
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {request.title}
                </h3>
              )}
              {request.description && (
                <p className="text-sm text-gray-400">{request.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
