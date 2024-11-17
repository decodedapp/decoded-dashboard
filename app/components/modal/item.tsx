import { HoverItemInfo } from "@/types/model";

export const ItemModal = (hoverItemInfo: { hoverItemInfo: HoverItemInfo }) => {
  return (
    <dialog
      id="my_modal_3"
      className="modal flex flex-col w-[500px] h-[800px] bg-white rounded-xl p-2 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
    >
      <h1 className="text-xl font-bold p-2 border-b border-black-opacity-20 w-full mb-2 text-center">
        Add New Item
      </h1>
      <input
        type="text"
        placeholder="* Name"
        value={""}
        onChange={(e) => {}}
        className="input input-bordered w-full mb-2 dark:bg-white"
      />
      <div className="flex">
        <input
          type="text"
          placeholder="* Price"
          value={""}
          onChange={(e) => {}}
          className="input input-bordered w-full mb-2 dark:bg-white"
        />
      </div>
      <input
        type="text"
        placeholder="URL(Optional)"
        value={""}
        onChange={(e) => {}}
        className="input input-bordered w-full mb-2 dark:bg-white"
      />
      <input
        type="text"
        placeholder="Designer(Optinal)"
        value={""}
        onChange={(e) => {}}
        className="input input-bordered w-full mb-2 dark:bg-white"
      />
    </dialog>
  );
};
