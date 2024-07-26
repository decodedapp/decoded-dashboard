"use client";
import Image from "next/image";
import {
  useState,
  ChangeEvent,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import {
  TaggedItem,
  ItemInfo,
  ImageInfo,
  BrandInfo,
  ArtistInfo,
  HoverItemInfo,
  FeaturedInfo,
  Position,
} from "@/types/model";
import { FirebaseHelper } from "@/network/firebase";
import {
  ConvertImageAndCompress,
  getByteSize,
  create_doc_id,
  validateEmail,
} from "@/utils/util";
import { sha256 } from "js-sha256";
import { ArtistModal, BrandModal, ItemModal } from "@/app/components/modal";

function AdminLogin({
  params,
}: {
  params: {
    setIsLogin: Dispatch<SetStateAction<boolean>>;
  };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      alert("Invalid email format");
      return;
    }
    FirebaseHelper.adminLogin(email, password).then((isAdmin) => {
      if (isAdmin) {
        params.setIsLogin(true);
      } else {
        alert("No Permission!");
      }
    });
  };

  return (
    <div className="flex flex-1 w-full h-screen items-center justify-center">
      <div className="flex flex-col">
        <input
          type="text"
          placeholder="id"
          className="border border-black w-full max-w-xs bg-white p-3 fill-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          className="border border-black w-full max-w-xs mt-5 bg-white p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-white text-black border border-black mt-5"
        >
          Login
        </button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [isLogin, setIsLogin] = useState(false);
  const [isDataAdded, setIsDataAdded] = useState(false);
  const [brands, setBrands] = useState<string[] | null>(null);
  const [artists, setArtists] = useState<string[] | null>(null);
  const [items, setItems] = useState<ItemInfo[] | null>(null);
  const [selectedTab, setSelectedTab] = useState("upload");

  useEffect(() => {
    const fetchData = async () => {
      if (!isLogin) return;
      console.log("Fetching brands and artists...");
      const artists: string[] = [];
      const brands: string[] = [];
      const items: ItemInfo[] = [];

      Promise.all([
        FirebaseHelper.docs("brands"),
        FirebaseHelper.docs("artists"),
        FirebaseHelper.docs("items"),
      ]).then(([b, a, i]) => {
        b.forEach((doc) => {
          const brand = doc.data() as BrandInfo;
          brands.push(brand.name);
          setBrands(brands);
        });
        a.forEach((doc) => {
          const artist = doc.data() as ArtistInfo;
          artists.push(artist.name);
          setArtists(artists);
        });
        i.forEach((doc) => {
          const item = doc.data() as ItemInfo;
          items.push(item);
          setItems(items);
        });
        setIsDataAdded(false);
      });
    };
    fetchData();
  }, [isLogin, isDataAdded]);

  return !isLogin ? (
    <AdminLogin params={{ setIsLogin: setIsLogin }} />
  ) : (
    <div>
      <div className="grid grid-cols-3 border border-black">
        <div
          className={`p-4 text-center cursor-pointer border border-black transition-colors ${
            selectedTab === "upload"
              ? "bg-black text-white"
              : "hover:bg-gray-300 bg-white"
          }`}
          onClick={() => setSelectedTab("upload")}
        >
          Upload
        </div>
        <div
          className={`p-4 text-center cursor-pointer border border-black transition-colors ${
            selectedTab === "featured"
              ? "bg-black text-white"
              : "hover:bg-gray-300 bg-white"
          }`}
          onClick={() => setSelectedTab("featured")}
        >
          Featured
        </div>
        <div
          className={`p-4 text-center cursor-pointer border border-black transition-colors ${
            selectedTab === "request"
              ? "bg-black text-white"
              : "hover:bg-gray-300 bg-white"
          }`}
          onClick={() => setSelectedTab("request")}
        >
          Request
        </div>
      </div>
      <div className=" bg-white">
        <div className={selectedTab === "upload" ? "block" : "hidden"}>
          <UploadImageSection
            brands={brands}
            artists={artists}
            items={items}
            setIsDataAdded={setIsDataAdded}
          />
        </div>
        <div className={selectedTab === "featured" ? "block" : "hidden"}>
          <UploadFeaturedSection />
        </div>
        <div className={selectedTab === "request" ? "block" : "hidden"}>
          <RequestListSection />
        </div>
      </div>
    </div>
  );
}

function UploadImageSection({
  brands,
  artists,
  items,
  setIsDataAdded,
}: {
  brands: string[] | null;
  artists: string[] | null;
  items: ItemInfo[] | null;
  setIsDataAdded: (isDataAdded: boolean) => void;
}) {
  const [uploadImageState, setUploadImageState] = useState<UploadImageState>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<{
    [key: number]: string;
  }>({});
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );
  const [isAdd, setIsAdd] = useState<{ [key: number]: boolean }>({});

  const handleSearchKeyword = (index: number, keyword: string) => {
    setSearchKeywords((prev) => ({ ...prev, [index]: keyword }));
  };

  const upload = async () => {
    setIsUploading(true);
    console.log(uploadImageState);
    if (!uploadSanityCheck()) {
      alert("Required fields are empty!");
      setIsUploading(false);
      return;
    }
    const file = uploadImageState?.imageFile;
    const hoverItemInfo = uploadImageState?.hoverItems;
    // It is safe to force unwrap due to sanity check
    const tags = await prepareTags(file!, hoverItemInfo!);
    console.log(tags);
    if (tags instanceof Error) {
      alert("Error preparing tags!");
      setIsUploading(false);
      return false;
    }
    const requiredKeys = ["brands", "artists", "images", "items"];
    if (!(await tagsSanityCheck(tags, requiredKeys))) {
      alert("Invalid tags!");
      setIsUploading(false);
      return;
    }
    console.log("Tags Info: ", tags);
    console.log("Handle hover item");
    // "items"
    let taggedItems = await handleUploadHoverItem(tags, requiredKeys);
    if (taggedItems instanceof Error) {
      console.error("Error saving hover item:", taggedItems);
      alert("Error saving hover item!");
      return;
    }
    console.log("Handle upload image");
    // "images"
    await handleUploadImage(tags, taggedItems);
    console.log("Handle remain tags");
    // "brands", "artists"
    await handleRemain(tags, requiredKeys);
    console.log("Upload: All Done! ✅");
    reset();
    setIsUploading(false);
  };

  const tagsSanityCheck = async (
    tags: Record<string, string[]>,
    requiredKeys: string[]
  ): Promise<boolean> => {
    // 1. Check whether required keys are in tags
    const missingKeys = requiredKeys.filter((key) => !tags.hasOwnProperty(key));
    if (missingKeys.length > 0) {
      return false;
    }
    // 2. Check for duplicate in db
    const imageDocExists = await FirebaseHelper.docExists(
      "images",
      tags["images"][0]
    );
    if (imageDocExists) {
      // If image is already exist, then it is not good
      return false;
    }
    const brandDocExists = tags["brands"].map(
      async (b) => await FirebaseHelper.docExists("brands", b)
    );
    if (brandDocExists.some((b) => !b)) {
      return false;
    }
    const artistDocExists = tags["artists"].map(
      async (a) => await FirebaseHelper.docExists("artists", a)
    );
    if (artistDocExists.some((a) => !a)) {
      return false;
    }

    return true;
  };

  const uploadSanityCheck = (): boolean => {
    if (!uploadImageState) {
      return false;
    }

    const requiredFields = [
      uploadImageState.imageName,
      uploadImageState.imageFile,
      uploadImageState.description,
      uploadImageState.hoverItems,
      uploadImageState.selectedImageUrl,
    ];

    if (requiredFields.some((field) => !field)) {
      return false;
    }

    const hasValidHoverItems = uploadImageState.hoverItems!.every((item) => {
      const { category, name, price } = item.info;
      const isAdditionalInfoNeeded = category !== "location";
      var hasCommonFields: boolean = true;
      if (item.isNew) {
        hasCommonFields =
          item.artistName !== undefined &&
          item.hoverItemImg !== undefined &&
          name.length > 0 &&
          category.length > 0 &&
          (!isAdditionalInfoNeeded || item.brandName !== undefined);
      }

      if (isAdditionalInfoNeeded) {
        return (
          hasCommonFields && price && price[0].length > 0 && price[1].length > 0
        );
      } else {
        return hasCommonFields;
      }
    });

    return hasValidHoverItems;
  };

  const prepareTags = async (
    file: File,
    hoverItems: HoverItemInfo[]
  ): Promise<Record<string, string[]> | Error> => {
    const tags: Record<string, string[]> = {};
    const artistNames: string[] = [];
    for (let index = 0; index < hoverItems.length; index++) {
      // Which item
      const hoverItemInfo = hoverItems[index];
      // Item Doc Id = Hash(item_name)
      const item_doc_id = sha256(hoverItemInfo.info.name);
      if (!artistNames.includes(hoverItemInfo.artistName!)) {
        artistNames.push(hoverItemInfo.artistName!);
      }
      // Artist Doc Id = Hash(artist_name)
      const artist_doc_id = sha256(hoverItemInfo.artistName!);
      if (!hoverItemInfo.isNew) {
        hoverItemInfo.brandName = hoverItemInfo.info.brands;
      } else {
        if (!hoverItemInfo.brandName) {
          throw new Error("No brandName");
        }
      }
      // Create brand doc ids related to this item
      const brand_doc_ids =
        hoverItemInfo.brandName?.map((b) => sha256(b)) ?? [];
      // Item Doc Ids = { "items" => [] }
      tags["items"] = Array.from(
        new Set([...(tags["items"] || []), item_doc_id])
      );
      // Brand Doc Ids = { "brands" => [] }
      tags["brands"] = Array.from(
        new Set([...(tags["brands"] || []), ...brand_doc_ids])
      );
      // { item_doc_id => brands }
      // Brands that related to this item
      tags[item_doc_id] = brand_doc_ids;
      // { artist_doc_id+"items" => [] }
      // Items that related to this artist
      tags[artist_doc_id + "items"] = [
        ...(tags[artist_doc_id + "items"] || []),
        item_doc_id,
      ];
      // What it does:
      // { artist_doc_id+"brands" => [] }
      // { brand_doc_id+"items" => [] }
      // { brand_doc_id+"artists" => [] }
      brand_doc_ids.forEach((b) => {
        // Brand that related to artist
        tags[artist_doc_id + "brands"] = [
          ...(tags[artist_doc_id + "brands"] || []),
          b,
        ];
        // Item that related to brand
        tags[b + "items"] = [...(tags[b + "items"] || []), item_doc_id];
        // Artist that related to brand
        tags[b + "artists"] = [...(tags[b + "artists"] || []), artist_doc_id];
      });
    }
    const image_doc_id = sha256(await file.arrayBuffer());
    tags["images"] = [image_doc_id];
    const artist_doc_id = artistNames.map((name) => create_doc_id(name));
    tags["artists"] = Array.from(new Set(artist_doc_id));

    return tags;
  };

  const handleItemInfo = async (
    docExists: boolean,
    itemDocId: string,
    requiredKeys: string[],
    tags: Record<string, string[]>,
    hoverItem: HoverItemInfo
  ): Promise<ItemInfo> => {
    var itemInfo: ItemInfo;
    const item_doc_id = sha256(hoverItem.info.name);
    const brand_doc_ids = tags[item_doc_id];
    hoverItem.info.tags = {
      images: tags["images"],
      brands: brand_doc_ids,
      artists: tags["artists"],
    };
    if (docExists) {
      // Get existed document
      const existedItem = await FirebaseHelper.doc("items", itemDocId);
      itemInfo = existedItem.data() as ItemInfo;
      // Update tags
      requiredKeys.forEach((key) => {
        if (itemInfo.tags) {
          // If tags already exists, concat new tags with old tags
          var newTags = itemInfo.tags[key] ?? [];
          newTags = Array.from(new Set(newTags.concat(tags[key])));
          itemInfo.tags[key] = newTags;
        } else {
          // There's no tags info
          itemInfo.tags = {
            [key]: tags[key],
          };
        }
      });
    } else {
      // No document for given 'itemDocId'
      // Create new document
      itemInfo = hoverItem.info;
    }

    return itemInfo;
  };

  const handleImageTags = (
    tags: Record<string, string[]>,
    imageInfo: ImageInfo
  ) => {
    imageInfo.tags = {
      items: tags["items"],
      brands: tags["brands"],
      artists: tags["artists"],
    };
  };

  const reset = () => {
    setUploadImageState({});
    setSelectedPointIndex(null);
  };

  const removePoint = (index: number) => {
    const updatedHoverItems = uploadImageState?.hoverItems?.filter(
      (_, itemIndex) => itemIndex !== index
    );
    if (updatedHoverItems?.length === 0) {
      setUploadImageState((prev) => ({
        ...prev,
        hoverItems: undefined,
      }));
    } else {
      setUploadImageState((prev) => ({
        ...prev,
        hoverItems: updatedHoverItems,
      }));
    }
    setSelectedPointIndex(null);
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadImageState({});
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileURL = URL.createObjectURL(file);
      setUploadImageState((prevState) => ({
        ...prevState,
        selectedImageUrl: fileURL,
        imageFile: file,
      }));
    }
  };

  const handlePointClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const topPercent = `${((y / rect.height) * 100).toFixed(2)}%`;
    const leftPercent = `${((x / rect.width) * 100).toFixed(2)}%`;

    setUploadImageState((prevState) => ({
      ...prevState,
      hoverItems: [
        ...(prevState?.hoverItems ?? []),
        {
          isNew: true,
          pos: { top: topPercent, left: leftPercent },
          info: {
            name: "",
            price: ["", ""],
            hyped: 0,
            affiliateUrl: "",
            imageUrl: "",
            category: "",
            tags: {},
            description: "",
          },
        },
      ],
    }));
  };

  const handleHoverItemInfo = (
    index: number,
    field: keyof ItemInfo | undefined,
    isCurrency: boolean,
    value: number | string | string[] | File
  ) => {
    setUploadImageState((prevState) => {
      if (!prevState) return {}; // prevState가 null이면 아무 작업도 하지 않고 null을 반환

      const hoverItems = prevState.hoverItems || [];
      // prevState에서 hoverItems를 복사하여 새로운 배열을 생성
      const updatedHoverItems = [...hoverItems];

      // field 값에 따라 적절한 타입으로 값을 할당
      if (field === "tags") {
        return prevState; // tags는 여기서 처리하지 않음
      } else if (field === "hyped") {
        updatedHoverItems[index].info[field] = value as number;
      } else if (field === "price") {
        if (isCurrency) {
          updatedHoverItems[index].info[field]![1] = value as string;
        } else {
          updatedHoverItems[index].info[field]![0] = value as string;
        }
      } else if (field === "brands") {
        return prevState; // brands는 여기서 처리하지 않음
      } else {
        if (field) {
          // Reamining fields
          updatedHoverItems[index].info[field] = value as string;
        } else {
          if (value instanceof File) {
            updatedHoverItems[index].hoverItemImg = value;
          } else if (value instanceof Array) {
            // Brands
            updatedHoverItems[index].brandName = value as string[];
          } else {
            // Artist
            updatedHoverItems[index].artistName = value as string;
          }
        }
      }
      // 업데이트된 hoverItems로 상태를 업데이트
      return { ...prevState, hoverItems: updatedHoverItems };
    });
  };

  // TODO: Duplicate doc ids
  const handleRemain = async (
    tags: Record<string, string[]>,
    requiredKeys: string[]
  ) => {
    tags["brands"].forEach(async (b) => {
      // Get existed brand document
      // We can assume that brand document exists because we already checked it in `tagsSanityCheck` function
      var brandInfo = (
        await FirebaseHelper.doc("brands", b)
      ).data() as BrandInfo;
      requiredKeys.forEach((key) => {
        // Skip for "brands"
        if (key === "brands") return;
        var custom_key: string;
        if (key === "images") {
          // Key = "images"
          custom_key = key;
        } else {
          // e.g Key = "brand_doc_id" + "items"
          // e.g Key = "brand_doc_id" + "artists"
          custom_key = b + key;
        }
        if (brandInfo.tags) {
          // If tags already exists, concat new tags with old tags
          var newTags = brandInfo.tags[key] ?? [];
          newTags = Array.from(new Set(newTags.concat(tags[custom_key])));
          brandInfo.tags[key] = newTags;
        } else {
          // There's no tags info
          brandInfo.tags = {
            [key]: tags[custom_key],
          };
        }
      });
      await FirebaseHelper.setDoc("brands", b, brandInfo);
    });
    tags["artists"].forEach(async (a) => {
      // We can assume artist exists on db
      const artistInfo = (
        await FirebaseHelper.doc("artists", a)
      ).data() as ArtistInfo;
      requiredKeys.forEach((key) => {
        // Handled only "items", "brands", "images" tags. Skip for "artists"
        if (key === "artists") return;
        var custom_key: string;
        if (key === "images") {
          // "images"
          custom_key = key;
        } else {
          // e.g  "artist_doc_id" + "items"
          // e.g "artist_doc_id" + "brands"
          custom_key = a + key;
        }
        if (artistInfo.tags) {
          // 1. Get existed tags
          var newTags = artistInfo.tags[key] ?? [];
          // 2. Concat with new tags with given custom_key
          newTags = Array.from(new Set(newTags.concat(tags[custom_key])));
          // 3. Update tags info
          artistInfo.tags[key] = newTags;
        } else {
          // No tag info in document
          //
          artistInfo.tags = {
            [key]: tags[custom_key],
          };
        }
      });
      await FirebaseHelper.setDoc("artists", a, artistInfo);
    });
  };

  const handleUploadImage = async (
    tags: Record<string, string[]>,
    taggedItems: TaggedItem[]
  ) => {
    const imageInfo: ImageInfo = {
      title: uploadImageState?.imageName!,
      description: uploadImageState?.description,
      hyped: 0,
      taggedItem: taggedItems,
      updateAt: new Date(),
      tags: {},
    };
    try {
      const imageFile = await ConvertImageAndCompress(
        uploadImageState?.imageFile!,
        1,
        1280
      );
      // path = "images/{image_doc_id}"
      const path = "images/" + tags["images"][0];
      const image_doc_id = tags["images"][0];
      // Upload image to storage
      await FirebaseHelper.uploadDataToStorage(path, imageFile, {
        customMetadata: {
          // Hash of image is only one
          id: image_doc_id,
        },
      });
      handleImageTags(tags, imageInfo);
      // Upload `imageInfo` to db
      await FirebaseHelper.setDoc("images", image_doc_id, imageInfo);
      console.log(
        "Original File Size (KB):",
        (uploadImageState?.imageFile!.size! / 1024).toFixed(2)
      );
      console.log(
        "Compressed File Size (KB):",
        (imageFile.size / 1024).toFixed(2)
      );
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error saving image detail:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadHoverItem = async (
    tags: Record<string, string[]>,
    requiredKeys: string[]
  ): Promise<TaggedItem[] | Error> => {
    var taggedItems: TaggedItem[] = [];
    const hoverItems = uploadImageState?.hoverItems!;
    for (let index = 0; index < hoverItems.length; index++) {
      const itemDocId = tags["items"][index];
      console.log("Set document for ", itemDocId);
      const docExists = await FirebaseHelper.docExists("items", itemDocId);
      const hoverItemImg = hoverItems[index].hoverItemImg;
      var hoverItem = hoverItems[index];

      // Storage name => {item_doc_id}
      const storage_file_name = itemDocId;
      // Upload item if it is new
      // Handle image such as converting to webp and uploading to db
      if (hoverItem.isNew) {
        if (
          hoverItemImg &&
          (hoverItemImg.type.includes("jpeg") ||
            hoverItemImg.type.includes("png") ||
            hoverItemImg.type.includes("webp") ||
            hoverItemImg.type.includes("avif"))
        ) {
          try {
            if (!docExists) {
              console.log("Trying to convert to webp...");
              const itemImage = await ConvertImageAndCompress(
                hoverItemImg,
                1,
                1280
              );
              console.log("Convert & Compress done!");
              console.log("Creating storage ref items/", storage_file_name);
              // TODO: Duplicate check
              if (await FirebaseHelper.docExists("items", storage_file_name)) {
                alert("Item already exists!");
                return new Error("Item already exists!");
              }
              const uploadRes = await FirebaseHelper.uploadDataToStorage(
                "items/" + storage_file_name,
                itemImage
              );
              const downloadUrl = await FirebaseHelper.downloadUrl(
                uploadRes.ref
              );
              hoverItem.info.imageUrl = downloadUrl;
              // Update brands for item
              hoverItem.info.brands = hoverItem.brandName;
            }
          } catch (error) {
            console.error("Error saving item image:", error, hoverItem);
            alert("Error saving item image!");
            return new Error("Error saving item image!");
          }
        } else {
          alert(
            "Image file format is not valid! Should be either jpeg, png, webp, avif"
          );
          setIsUploading(false);
          return new Error("Image file format is not valid!");
        }
      }
      // Update itemInfo based on whether document exists or not
      const itemInfo = await handleItemInfo(
        docExists,
        itemDocId,
        requiredKeys,
        tags,
        hoverItem
      );
      await FirebaseHelper.setDoc("items", itemDocId, itemInfo);
      console.log("Done!");
      taggedItems.push({ id: itemDocId, pos: hoverItem.pos });
    }
    return taggedItems;
  };

  const filteredBrands = (index: number) => {
    if (!brands) return [];
    if (!searchKeywords[index]) return brands;
    return brands.filter((brand) =>
      brand.toLowerCase().includes(searchKeywords[index]?.toLowerCase() || "")
    );
  };

  return (
    <div className="overflow-y-scroll">
      <div className="flex flex-col md:flex-row items-center justify-center overflow-y-scroll">
        <div className="flex flex-col w-full md:w-[50%]">
          <input
            type="file"
            onChange={handleImageChange}
            className="mb-2 p-2"
          />
          {/* Image Section */}
          {uploadImageState?.selectedImageUrl && (
            <div className="relative w-full h-[60vh] aspect-w-3 aspect-h-4">
              <Image
                src={uploadImageState?.selectedImageUrl}
                alt="Featured fashion"
                fill={true}
                style={{ objectFit: "cover" }}
                onClick={handlePointClick}
              />
              {uploadImageState?.hoverItems?.map((item, index) => (
                <div
                  key={index}
                  className={`absolute w-3 h-3 bg-white border border-black rounded-full cursor-pointer ${
                    index === selectedPointIndex
                      ? "opacity-100 point-animation"
                      : "opacity-50"
                  }`}
                  style={{
                    top: item.pos.top,
                    left: item.pos.left,
                  }}
                  onClick={() => setSelectedPointIndex(index)}
                ></div>
              ))}
            </div>
          )}
        </div>
        {/* HoverItem Section */}
        <div className="flex-1 w-full h-[80vh]">
          <div className="flex">
            {uploadImageState?.hoverItems?.map((_item, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full border border-black m-2 p-1 cursor-pointer items-center justify-center ${
                  index === selectedPointIndex ? "bg-black text-white" : ""
                }`}
                onClick={() => setSelectedPointIndex(index)}
              >
                <p className="text-sm">{index}</p>
              </div>
            ))}
          </div>
          {uploadImageState?.hoverItems?.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col justify-between p-2 ${
                index === selectedPointIndex ? "block" : "hidden"
              }`}
              onClick={() => setSelectedPointIndex(index)}
            >
              <div>
                <p className="text-md font-bold">Artist</p>
                <div className="flex justify-center mt-2">
                  <select
                    multiple={false}
                    className="input border border-black w-full dark:bg-white"
                    value={item.artistName}
                    onChange={(e) => {
                      handleHoverItemInfo(
                        index,
                        undefined,
                        false,
                        e.target.value
                      );
                    }}
                  >
                    {artists?.map((artist, index) => (
                      <option key={index} value={artist}>
                        {artist
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </option>
                    ))}
                  </select>
                  <button
                    className="ml-2 text-black border border-black w-[100px] rounded-lg"
                    onClick={() =>
                      (
                        document.getElementById(
                          "my_modal_1"
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                  >
                    +
                  </button>
                  <ArtistModal setIsDataAdded={setIsDataAdded} />
                </div>
                <p className="text-md font-bold mt-2">Item Detail</p>
                <CustomDropdown
                  items={items}
                  pos={uploadImageState.hoverItems?.[index].pos}
                  index={index}
                  setIsAdd={setIsAdd}
                  setUploadImageState={setUploadImageState}
                />
                {isAdd[index] && (
                  <>
                    <input
                      type="text"
                      placeholder="Name"
                      value={item.info.name}
                      onChange={(e) => {
                        handleHoverItemInfo(
                          index,
                          "name",
                          false,
                          e.target.value
                        );
                      }}
                      className="input border border-black w-full mb-2 dark:bg-white"
                    />
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Price"
                        value={item.info.price?.[0]}
                        onChange={(e) => {
                          handleHoverItemInfo(
                            index,
                            "price",
                            false,
                            e.target.value
                          );
                        }}
                        className="input border border-black w-full mb-2 dark:bg-white"
                      />
                      <select
                        value={item.info.price?.[1]}
                        onChange={(e) => {
                          handleHoverItemInfo(
                            index,
                            "price",
                            true,
                            e.target.value
                          );
                        }}
                        className="input w-20 mb-2 dark:bg-white"
                      >
                        {Object.values(Currency).map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="URL"
                      value={item.info.affiliateUrl}
                      onChange={(e) => {
                        handleHoverItemInfo(
                          index,
                          "affiliateUrl",
                          false,
                          e.target.value
                        );
                      }}
                      className="input border border-black w-full mb-2 dark:bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Designer"
                      value={item.info.designedBy}
                      onChange={(e) => {
                        handleHoverItemInfo(
                          index,
                          "designedBy",
                          false,
                          e.target.value
                        );
                      }}
                      className="input border border-black w-full mb-2 dark:bg-white"
                    />
                    <div className="flex">
                      <select
                        value={item.info.category}
                        onChange={(e) => {
                          handleHoverItemInfo(
                            index,
                            "category",
                            false,
                            e.target.value
                          );
                        }}
                        className="input border border-black w-full mb-2 dark:bg-white"
                      >
                        {Object.values(ItemCategory).map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-md font-bold">Item Brand</p>
                    <div className="my-2">
                      <input
                        type="text"
                        placeholder="브랜드 검색..."
                        className="input border border-black w-full mb-2 dark:bg-white"
                        value={searchKeywords[index] || ""} // 초기값을 빈 문자열로 설정
                        onChange={(e) => {
                          setSearchKeywords((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }));
                        }}
                      />
                      <div className="flex">
                        <select
                          multiple={true}
                          className="input border border-black w-full dark:bg-white"
                          value={item.brandName || []} // 초기값을 빈 배열로 설정
                          onChange={(e) => {
                            const selectedOptions = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            handleHoverItemInfo(
                              index,
                              undefined,
                              false,
                              selectedOptions
                            );
                          }}
                        >
                          {filteredBrands(index)?.map((brand, index) => (
                            <option key={index} value={brand}>
                              {brand
                                .split("_")
                                .map((word) => word.toUpperCase())
                                .join(" ")}
                            </option>
                          ))}
                        </select>
                        <button
                          className="text-black border border-black rounded-lg w-[100px] ml-2"
                          onClick={() =>
                            (
                              document.getElementById(
                                "my_modal_2"
                              ) as HTMLDialogElement
                            )?.showModal()
                          }
                        >
                          +
                        </button>
                        <BrandModal setIsDataAdded={setIsDataAdded} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-md font-bold">Item Image</p>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleHoverItemInfo(
                            index,
                            undefined,
                            false,
                            e.target.files![0]
                          )
                        }
                        className="mt-2 w-full dark:bg-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {uploadImageState?.selectedImageUrl && (
        <div className="m-2">
          <p className="text-md font-bold">Additional Info</p>
          <input
            type="text"
            placeholder="Image Title (e.g Rose in NYC)"
            value={uploadImageState?.imageName ?? ""}
            onChange={(e) =>
              setUploadImageState({
                ...uploadImageState,
                imageName: e.target.value,
              })
            }
            className="input border border-black w-full mb-2 dark:bg-white"
          />
          {/* TODO: Replace with generated by LLM */}
          <input
            type="text"
            placeholder="Description"
            value={uploadImageState?.description ?? ""}
            onChange={(e) => {
              const inputText = e.target.value;
              if (getByteSize(inputText) <= 500) {
                setUploadImageState({
                  ...uploadImageState,
                  description: inputText,
                });
              }
            }}
            className="input border border-black w-full mb-2 dark:bg-white"
          />
          <button
            onClick={upload}
            className="bg-white border border-black w-full p-2 mt-4"
          >
            {isUploading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function UploadFeaturedSection() {
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredInfo, setFeaturedInfo] = useState<FeaturedInfo>({
    imageUrl: "",
    title: "",
    description: "",
    category: "",
    images: [],
  });

  const handleFeaturedInfo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFeaturedInfo((prevInfo) => {
      return {
        ...prevInfo,
        [e.target.name]: e.target.value,
      };
    });
  };

  return (
    <div className="flex flex-col p-2">
      <input
        type="file"
        onChange={(e) => setFeaturedImage(e.target.files![0])}
        className="mb-4"
      />
      {featuredImage && (
        <div className="flex w-full">
          <div className="flex relative w-[50%] h-[40vh]">
            <Image
              src={URL.createObjectURL(featuredImage)}
              alt="Featured fashion"
              fill={true}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="flex flex-col w-[50%] pl-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={featuredInfo.title}
              onChange={handleFeaturedInfo}
              className="input border border-black w-full mb-2 dark:bg-white"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={featuredInfo.description}
              onChange={handleFeaturedInfo}
              className="input border border-black w-full mb-2 h-24 dark:bg-white"
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={featuredInfo.category}
              onChange={handleFeaturedInfo}
              className="input border border-black w-full mb-2 dark:bg-white"
            />
            <input
              type="text"
              name="images"
              placeholder="Additional Images (comma-separated URLs)"
              value={featuredInfo.images.join(",")}
              onChange={(e) =>
                setFeaturedInfo((prevInfo) => ({
                  ...prevInfo,
                  images: e.target.value.split(",").map((url) => url.trim()),
                }))
              }
              className="input border border-black w-full mb-2 dark:bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface Request {
  request_id: string;
  description: string;
  name: string;
  status: string;
}

function RequestListSection() {
  const [requests, setRequests] = useState<Request[]>([]);

  return (
    <div className="p-2 m-10">
      {/* 데스크톱 뷰 */}
      <div className="hidden md:block">
        <table className="table-auto w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">요청 ID</th>
              <th className="px-4 py-2">설명</th>
              <th className="px-4 py-2">이름</th>
              <th className="px-4 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.request_id}>
                  <td className="border px-4 py-2">{request.request_id}</td>
                  <td className="border px-4 py-2">{request.description}</td>
                  <td className="border px-4 py-2">{request.name}</td>
                  <td className="border px-4 py-2">{request.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center text-gray-500 text-xl"
                >
                  NO DATA
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 모바일 뷰 */}
      <div className="md:hidden">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.request_id}
              className="bg-white shadow-md rounded-lg mb-4 p-4"
            >
              <p>
                <strong>요청 ID:</strong> {request.request_id}
              </p>
              <p>
                <strong>설명:</strong> {request.description}
              </p>
              <p>
                <strong>이름:</strong> {request.name}
              </p>
              <p>
                <strong>상태:</strong> {request.status}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-xl p-10">NO DATA</div>
        )}
      </div>
    </div>
  );
}

function CustomDropdown({
  items,
  pos,
  index,
  setIsAdd,
  setUploadImageState,
}: {
  items: ItemInfo[] | null;
  pos: Position | undefined;
  index: number;
  setIsAdd: Dispatch<
    SetStateAction<{
      [key: number]: boolean;
    }>
  >;
  setUploadImageState: Dispatch<SetStateAction<UploadImageState>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemInfo | null>(null);
  const [isSelect, setIsSelect] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (item: ItemInfo) => {
    setSelectedItem(item);
    setIsOpen(false);
    setIsSelect(true);
    setUploadImageState((prev) => {
      if (!prev) return {};

      const hoverItems = prev.hoverItems || [];
      const copy = [...hoverItems];
      copy[index].isNew = false;
      copy[index].pos = pos!;
      copy[index].info = item;
      return { ...prev, hoverItems: copy };
    });
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setIsSelect(false);
    setIsAdd((prev) => ({ ...prev, [index]: false }));
    setUploadImageState((prev) => {
      if (!prev) return {};

      const hoverItems = prev.hoverItems || [];
      hoverItems.splice(index, 1);
      return { ...prev, hoverItems };
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items?.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="input border border-black w-full dark:bg-white"
      >
        {selectedItem ? selectedItem.name : "Select Item"}
      </button>
      {isOpen && (
        <>
          <ul className="absolute z-10 w-full bg-white border border-gray-300">
            {currentItems?.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(item)}
              >
                <Image
                  src={item.imageUrl ?? ""}
                  alt={item.name}
                  width={30}
                  height={30}
                  style={{ marginRight: "10px", width: "30px", height: "30px" }}
                  className="border border-black"
                />
                <div>
                  <p>{item.name}</p>
                </div>
              </li>
            ))}
            <div className="flex justify-evenly mt-2 ">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn bg-[#FF204E]"
              >
                이전
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  items
                    ? currentPage === Math.ceil(items.length / itemsPerPage)
                    : true
                }
                className="btn bg-[#FF204E]"
              >
                다음
              </button>
            </div>
          </ul>
        </>
      )}
      <div className="flex justify-between w-full">
        <button
          className={`text-black btn bg-white mb-2 mt-2 w-60 hover:text-white`}
          onClick={() =>
            setIsAdd((prev) => ({ ...prev, [index]: !prev[index] }))
          }
        >
          ADD ITEM
        </button>
        <button
          className={`text-black btn bg-white mb-2 mt-2 ml-2 hover:text-white`}
          onClick={clearSelection}
        >
          CLEAR
        </button>
      </div>
    </div>
  );
}

interface UploadImageState {
  selectedImageUrl?: string;
  hoverItems?: HoverItemInfo[];
  imageFile?: File;
  imageName?: string;
  description?: string;
}

enum ItemCategory {
  Clothing = "clothing",
  Paint = "paint",
  Furniture = "furniture",
  Accessory = "accessory",
  Shoes = "shoes",
  Bag = "bag",
  Location = "location",
}

enum Currency {
  USD = "USD",
  KRW = "KRW",
  EUR = "EUR",
  JPY = "JPY",
  GBP = "GBP",
}

export default AdminDashboard;
