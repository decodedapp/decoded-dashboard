import { useState } from "react";
import { BrandInfo } from "@/types/model";
import { networkManager } from "@/network/network";

enum SnsType {
  Instagram = "instagram",
  Youtube = "youtube",
}

export const BrandModal = ({
  setIsDataAdded,
  id,
}: {
  setIsDataAdded: (isDataAdded: boolean) => void;
  id: number;
}) => {
  const [brandName, setBrandName] = useState<Record<string, string>>({
    en: "",
    ko: "",
  });
  const [creativeDirectorEnInput, setCreativeDirectorEnInput] =
    useState<string>("");
  const [creativeDirectorKrInput, setCreativeDirectorKrInput] =
    useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [logoImage, setLogoImage] = useState<File>();
  const [sns, setSns] = useState<Record<string, string>>({});
  const handleSnsUrlChange =
    (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSns({ ...sns, [type]: e.target.value });
    };

  const defaultState = () => {
    setBrandName({ en: "", ko: "" });
    setCreativeDirectorEnInput("");
    setCreativeDirectorKrInput("");
    setWebsiteUrl("");
    setLogoImage(undefined);
    setSns({});
  };

  const upload = async () => {
    if (!brandName) {
      alert("브랜드 이름을 입력해주세요.");
      return;
    }

    if (
      !creativeDirectorEnInput ||
      !creativeDirectorKrInput ||
      !websiteUrl ||
      // !logoImage ||
      !sns ||
      creativeDirectorEnInput.length !== creativeDirectorKrInput.length
    ) {
      alert("Brand category or creative director is not set!");
      return;
    }
    //   const imageFile = await ConvertImageAndCompress(logoImage, 1, 1280);
    const creativeDirectorEnArray = creativeDirectorEnInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    console.log(creativeDirectorEnArray);
    const creativeDirectorKrArray = creativeDirectorKrInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    const cd = creativeDirectorEnArray.map((en, i) => ({
      en: en,
      ko: creativeDirectorKrArray[i],
    }));
    const newBrandInfo: BrandInfo = {
      name: brandName,
      // cd: cd,
      websiteUrl: websiteUrl,
      // logoImageUrl: url,
      sns: sns,
      tags: {},
    };
    const response = await networkManager.request(
      "upload/brand",
      "POST",
      newBrandInfo
    );
    console.log("Response", response);
    const docId = response.data.id;
    const imageName = docId + ".webp";
    const path = "logos/" + imageName;
    // const res = await networkManager.uploadDataToStorage(path, imageFile);
    // const url = await getDownloadURL(res.ref);
    defaultState();
    alert("Brand document is added successfully!");
  };

  return (
    <dialog
      id={`brand_modal_${id}`}
      className="modal flex flex-col w-[90vw] h-[90vh] p-4 bg-white rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll"
    >
      <div className="flex flex-col p-2 w-full">
        <button
          className="w-full text-right text-xl"
          onClick={() =>
            (
              document.getElementById(`brand_modal_${id}`) as HTMLDialogElement
            )?.close()
          }
        >
          x
        </button>
        <div>
          <p className="text-md font-bold mb-2">Brand Detail</p>
          <div>
            <p className=" text-md font-bold mb-2 text-black">Brand Name</p>
            <input
              type="text"
              placeholder="Brand Name (English)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={brandName.en}
              onChange={(e) =>
                setBrandName({ ...brandName, en: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Brand Name (Korean)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={brandName.kr}
              onChange={(e) =>
                setBrandName({ ...brandName, ko: e.target.value })
              }
            />
          </div>
          <div>
            <p className=" text-md font-bold mb-2 text-black">
              Creative Director
            </p>
            <input
              type="text"
              placeholder="Creative Director (English)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={creativeDirectorEnInput}
              onChange={(e) => setCreativeDirectorEnInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Creative Director (Korean)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={creativeDirectorKrInput}
              onChange={(e) => setCreativeDirectorKrInput(e.target.value)}
            />
          </div>
        </div>
        <div className="my-2">
          <p className="text-md font-bold mb-2">Website</p>
          <input
            type="text"
            placeholder="Website URL"
            className="input input-bordered w-full dark:bg-white"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>

        <div className="my-2">
          <p className="text-md font-bold mb-2">Logo</p>
          <input
            type="file"
            accept="image/*"
            className="w-full dark:bg-white"
            onChange={(e) => e.target.files && setLogoImage(e.target.files[0])}
          />
        </div>

        <div className="mt-2">
          <p className="text-md font-bold mb-2">SNS</p>
          {Object.values(SnsType).map((snsType) => (
            <div key={snsType}>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                {snsType.toUpperCase()} URL
              </label>
              <input
                type="text"
                placeholder={`Enter ${snsType} URL`}
                className="input input-bordered w-full mb-4 dark:bg-white"
                value={sns[snsType] || ""}
                onChange={handleSnsUrlChange(snsType)}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className="border border-black rounded-lg p-2 mt-2 w-full"
        onClick={upload}
      >
        추가
      </button>
    </dialog>
  );
};
