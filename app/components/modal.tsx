"use client";

import { useState, useEffect, Dispatch, SetStateAction, useId } from "react";
import { usePathname } from "next/navigation";
import { FirebaseHelper } from "@/network/firebase";
import { setDoc, doc } from "firebase/firestore";
import { sha256 } from "js-sha256";
import { BrandInfo, ArtistInfo } from "@/types/model";
import { arrayBufferToBase64, ConvertImageAndCompress } from "@/utils/util";
import { getDownloadURL } from "firebase/storage";
import { HoverItemInfo } from "@/types/model";
import { Button } from "@mui/material";
import { StopCircleRounded } from "@mui/icons-material";
import { networkManager } from "@/network/network";

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

export const ArtistModal = ({
  setIsDataAdded,
  id,
}: {
  setIsDataAdded: (isDataAdded: boolean) => void;
  id: number;
}) => {
  const [artistName, setArtistName] = useState<Record<string, string>>({
    en: "",
    ko: "",
  });
  const [artistCategories, setArtistCategories] = useState<string[]>([]);
  const [aka, setAka] = useState<string[]>([]);
  const [group, setGroup] = useState<Record<string, string>>({
    en: "",
    ko: "",
  });
  const [snsUrls, setSnsUrls] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File>();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setArtistCategories(selectedOptions);
  };

  const handleSnsUrlChange =
    (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSnsUrls({ ...snsUrls, [type]: e.target.value });
    };

  const handleAkaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const akaArray = e.target.value.split(",").map((item) => item.trim()); // 쉼표로 분리하고 공백 제거
    setAka(akaArray);
  };

  const defaultState = () => {
    setArtistName({ en: "", ko: "" });
    setArtistCategories([]);
    setAka([]);
    setGroup({ en: "", ko: "" });
    setSnsUrls({});
    setIsDataAdded(true);
  };

  const upload = async () => {
    if (!artistName || artistCategories.length === 0 || !imageFile) {
      alert("필수 입력 항목을 입력해주세요.");
      return;
    }
    const snsInfo = Object.entries(snsUrls).map(([platform, url]) => ({
      platform: platform,
      url: url,
    }));
    const newArtistInfo: ArtistInfo = {
      name: artistName,
      category: artistCategories,
      aka: aka,
      group: group,
      snsInfo: snsInfo,
    };
    const buf = await imageFile.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const requestBody = {
      artist_info: newArtistInfo,
      image_file: base64,
    };
    await networkManager.request("upload/artist", "POST", requestBody);
    defaultState();
    alert("Artist is added successfully!");
  };

  return (
    <dialog
      id={`artist_modal_${id}`}
      className="modal flex flex-col w-[90vw] h-[90vh] p-4 bg-white rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll"
    >
      <div className="flex flex-col p-2 w-full">
        <button
          className="w-full text-right text-xl"
          onClick={() =>
            (
              document.getElementById(`artist_modal_${id}`) as HTMLDialogElement
            )?.close()
          }
        >
          x
        </button>
        <div>
          <p className="text-md font-bold mb-2 text-black">Artist Detail</p>
          <div className="my-4">
            <p className="text-md font-bold mb-2 text-black">Profile Image</p>
            <input
              type="file"
              accept="image/*"
              className="w-full dark:bg-white"
              onChange={(e) =>
                e.target.files && setImageFile(e.target.files[0])
              }
            />
          </div>
          <div>
            <p className="text-md font-bold mb-2 text-black">아티스트 이름</p>
            <input
              type="text"
              placeholder="영어 이름 (예: Jennie)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={artistName.en}
              onChange={(e) =>
                setArtistName({ ...artistName, en: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="한국어 이름 (예: 제니)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={artistName.kr}
              onChange={(e) =>
                setArtistName({ ...artistName, ko: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="a.k.a (comma separated)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={aka.join(", ")} // 배열을 쉼표로 조합하여 문자열로 변환
              onChange={handleAkaChange}
            />
          </div>
          <div>
            <p className=" text-md font-bold mb-2 text-black">Group</p>
            <input
              type="text"
              placeholder="Group (English)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={group.en}
              onChange={(e) => setGroup({ ...group, en: e.target.value })}
            />
            <input
              type="text"
              placeholder="Group (Korean)"
              className="input input-bordered w-full mb-2 dark:bg-white"
              value={group.kr}
              onChange={(e) => setGroup({ ...group, ko: e.target.value })}
            />
          </div>
          <div>
            <p className=" text-md font-bold mb-2 text-black">SNS</p>
            {Object.values(SnsType).map((snsType) => (
              <div key={snsType}>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  {snsType.toUpperCase()} URL
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${snsType} URL`}
                  className="input input-bordered w-full mb-4 dark:bg-white"
                  value={snsUrls[snsType] || ""}
                  onChange={handleSnsUrlChange(snsType)}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-md font-bold mb-2 text-black">Category</p>
          <select
            multiple={true}
            className="dark:bg-white w-full"
            value={artistCategories}
            onChange={handleCategoryChange}
          >
            {Object.values(ArtistCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        className="border border-black rounded-lg p-2 mt-10 w-full"
        onClick={upload}
      >
        추가
      </button>
    </dialog>
  );
};

enum SnsType {
  Instagram = "instagram",
  Youtube = "youtube",
}

enum ArtistCategory {
  Photographer = "photographer",
  Videographer = "videographer",
  Designer = "designer",
  Model = "model",
  Musician = "musician",
  Actor = "actor",
  Artist = "artist",
  KPop = "kpop",
  Rapper = "rapper",
  Producer = "producer",
}
