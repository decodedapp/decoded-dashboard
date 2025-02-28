import React from "react";

function addMetadata() {
  return <div> Not implemented </div>;
}

export default addMetadata;

// <div className="relative w-full aspect-square bg-[#1A1A1A] rounded-lg">
//   {!hasFields.hasImage && (
//     <label
//       htmlFor={`image-upload-${item.itemDocId}`}
//       className="inset-0 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
//     >
//       {selectedFile[item.itemDocId] ? (
//         <div className="relative w-full h-full aspect-square">
//           <img
//             src={URL.createObjectURL(selectedFile[item.itemDocId])}
//             alt="Preview"
//             className="object-cover w-full h-full rounded-lg aspect-square"
//           />
//           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
//             <button className="px-4 py-2 bg-[#1A1A1A] rounded-md shadow-sm text-sm font-medium text-gray-700">
//               이미지 변경
//             </button>
//           </div>
//         </div>
//       ) : (
//         <button className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700">
//           아이템 이미지 업로드
//         </button>
//       )}
//     </label>
//   )}
//   <input
//     id={`image-upload-${item.itemDocId}`}
//     type="file"
//     accept="image/*"
//     className="hidden"
//     onChange={(e) => {
//       const file = e.target.files?.[0];
//       if (file) {
//         handleImageUpload(file, item.imageDocId, item.itemDocId);
//       }
//     }}
//   />
// </div>
