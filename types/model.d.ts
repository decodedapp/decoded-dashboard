
import type { ItemClass, ItemSubClass, MainCategory, SubCategoryMap, InstanceMap } from "@/constants/categories";
import { ProvideStatus } from "@/constants/schema";

/**
 * The ImageInfo interface defines the structure for image information.
 * @param title The title of the image.
 * @param updateAt The date of the last update.
 * @param items Optional array of tagged items.
 * @param tags Optional record of tags related to the image, with string keys and values.
 * @param description Optional description of the image.
 * @param extractedColors Optional array of extracted colors.
 */
export interface ImageInfo {
  /**
   * @example "New York Fashion Week 2024"
   */
  title: string;
  /**
   * @example "Runway"
   */
  subtitle?: string;
  /**
   * @example "Description for the image"
   */
  description?: string;
  /**
   * @example "https://example.com/image.jpg"
   */
  mainImageUrl: string;
  /**
   * @example ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
   */
  subImageUrls?: string[];
  /**
   * @example "grunge", "minimalist",
   */
  style?: string;
  /**
   * @example TaggedItem { "id": "123", "pos": { "top": "100px", "left": "100px" } }
   */
  items?: TaggedItem[] | HoverItem[];
  /**
   * @example { "background": ["#FFFFFF", "#000000"], "style": ["#FFFFFF", "#000000"] }
   */
  colorInfo?: string[];
  /**
   * @example "Source url"
   */
  source?: string;
  /**
   * @example { "brands": [${doc_id}], "images": ["${doc_id}"] }
   */
  tags?: Record<string, string[]>;
}

export interface SnsInfo {
  platform: string;
  url: string;
}

/**
 * The ArtistInfo interface defines the structure for artist information.
 * @param name The name of the artist.
 * @param category The category of the artist.
 * @param also_known_as Optional array of other names the artist is known by.
 * @param group Optional group the artist belongs to.
 * @param sns Optional record of social media links, with string keys and values.
 * @param tags Optional record of tags related to the artist, with string keys and values.
 */
export interface ArtistInfo {
  /**
   * Rule: Name should be in English.
   * @example {"en": "Jennie", "kr": "제니"}
   */
  name: Record<string, string>;
  /**
   * @example "photographer"
   */
  category: string;
  /**
   * @example "kr"
   */
  nationality?: string;
  /**
   * @example "https://example.com/image.jpg"
   */
  profileImageUrl?: string;
  /**
   * @example ["Jenni", "JenDeuk", "제니"]
   */
  aka?: string[];
  /**
   * @example {"en": "Black Pink", "kr": "블랙핑크"}
   */
  group?: Record<string, string>;
  /**
   * @example { "instagram": "https://www.instagram.com/jennie/", "twitter": "https://twitter.com/jennie" }
   */
  snsInfo?: SnsInfo[];
  /**
   * @example { "brands": [${doc_id}], "images": ["${doc_id}"] }
   */
  tags?: Record<string, string[]>;
}

export interface GroupInfo {
  name: string;
  /**
   * @example { "instagram": "https://www.instagram.com/blackpinkofficial/", "twitter": "https://twitter.com/blackpink" }
   */
  sns?: Record<string, string>;
  /**
   * @example { "artists": [${doc_id}] }
   */
  tags?: Record<string, string[]>;
}

/**
 * The TaggedItem interface defines the structure for tagged item information.
 * @param id The id of the tagged item.
 * @param pos The position of the tagged item.
 */
export interface TaggedItem {
  /**
   * @example "ItemInfo ${doc_id}"
   */
  id: string;
  /**
   * @example { "top": "100%", "left": "100%" }
   */
  pos: Position;
}

/**
 * The HoverItem interface defines the structure for hover item information.
 * @param pos The position of the hover item.
 * @param info The information of the hover item of type `ItemInfo`
 */
export interface HoverItem {
  /**
   * @example { "top": "100%", "left": "100%" }
   */
  pos: Position;
  /**
   * @example "ItemInfo {...}"
   */
  info: ItemInfo;
}

/**
 * The Position interface defines where `HoverItem` is located.
 * @param top The top position of the item.
 * @param left The left position of the item.
 */
export interface Position {
  /**
   * @example "100%"
   */
  top?: string;
  /**
   * @example "100%"
   */
  left?: string;
}

/**
 *
 * Interface for `ItemInfo`
 *
 * Fields
 * - name: Name of the item
 * - category: Name of the category if any
 * - hyped: Number of hyped(e.g Number of clicks)
 * - designedBy: Name of designer if any
 * - price: [price, currency]
 * - affiliateUrl: Affiliate URL
 * - imageUrl: Image URL
 * - season: Season
 * - runway_url: Runway URL
 * - tags: Tags
 */
export interface ItemInfo {
  /**
   * @example "Flared Cargo Pants"
   */
  name: string;
  /**
   * @example "Clothing"
   */
  category: string;

  /**
   * @example ["Brand1", "Brand2"]. Two if it is collab
   */
  brands?: string[];

  /**
   * @example "24ss"
   */
  season?: string;

  /**
   * @example "https://example.com/"
   */
  runway_url?: string;
  /**
   * @example "Demna Gvasalia"
   */
  designedBy?: string;
  /**
   * @example ["$100", "USD"]
   */
  price?: [string, string];
  /**
   * @example "https://example.com/?ref=123"
   */
  affiliateUrl?: string;
  /**
   * @example "https://example.com/image.jpg"
   */
  imageUrl?: string;
  /**
   * @example "Description for this item generated by LLM"
   */
  description?: string;
  /**
   * @example { "brands": [${doc_id}], "images": ["${doc_id}"] }
   */
  tags?: Record<string, string[]>;
}

export interface BrandInfo {
  name: Record<string, string>;
  cd?: Record<string, string>[];
  websiteUrl?: string;
  logoImageUrl?: string;
  snsInfo?: SnsInfo[];
  tags?: Record<string, string[]>;
}

export interface MainImage {
  imageUrl: string;
  docId: string;
  title?: string;
  tags?: string[];
  description?: string;
  itemInfoList: Map<ItemInfo, [Position, BrandInfo[]]>;
  artistInfoList?: ArtistInfo[];
}

/**
 * The ArticleInfo interface defines the structure for article information.
 * @param title The title of the article.
 * @param src Optional array of source URLs for the article. Could be multiple sources if article is generated by LLM model
 * @param createdAt Optional creation date of the article.
 * @param imageUrl Optional URL of an image associated with the article.
 * @param summary Optional summary of the article.
 * @param tags Optional record of tags related to the article, with string keys and values.
 */
export interface ArticleInfo {
  title: string;
  src?: string | string[];
  createdAt?: string;
  imageUrl?: string;
  summary?: string;
  tags?: Record<string, string>;
}

/**
 * Interface for uploading items
 */
interface HoverItemInfo {
  isNew: boolean;
  pos: Position;
  info: ItemInfo;
  /**
   * @example Raw artist name if it is new
   */
  artistName?: string;
  /**
   * @example Raw brand names
   */
  brandName?: string[];
  /**
   * @example Type would be `File` if it is new
   */
  hoverItemImg?: File | string;
}

interface ColorInfo {
  /**
   * @example ["#FFFFFF", "#000000"]
   */
  background?: string;
  /**
   * @example ["#FFFFFF", "#000000"]
   */
  style?: string[];
}

interface FeaturedInfo {
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  images: string[];
}

interface DetailPageState {
  /**
   * Image info
   */
  img?: ImageInfo;
  /**
   * Hover items
   */
  itemList?: HoverItem[];
  /**
   * Brand names
   */
  brandList?: string[];
  /**
   * Artist names
   */
  artistList?: string[];
  /**
   * [docId, imageUrl]
   */
  artistImgList?: [string, string][];
  /**
   * Artist articles
   */
  artistArticleList?: ArticleInfo[];
  /**
   * Artist items
   */
  artistItemList?: ItemInfo[];
  /**
   * Extracted color info from image
   */
  colorInfo?: ColorInfo;
}

interface ImageDetail {
  title: string;
  description: string;
  requestedItems: RequestedItem[];
}

interface RequestedItem {
  itemClass: string;
  itemSubClass: string;
  category: string;
  position: Position;
}

interface RequestImage {
  title: string;
  requestedItems: Record<string, RequestedItem[]>;
  requestBy: string;
  imageFile: string;
  metadata: Record<string, string>;
}

enum SnsType {
  Instagram = "instagram",
  Youtube = "youtube",
}

interface Point {
  x: number;
  y: number;
  itemClass?: ItemClass;
  itemSubClass?: ItemSubClass;
  category?: string;
}

interface SaleInfo {
  url: string;
  price: string;
  currency: string;
  isAffiliated: boolean;
  isSoldout: boolean;
}

interface ItemDetail<T> {
  provideInfo: ProvideInfo<T>;
  requester: string;
  requestedAt: string;
}

interface ItemDocument {
  Id: string;
  name: ItemDetail<string>;
  brand: ItemDetail<string>;
  designedBy: ItemDetail<string>;
  saleInfo: ItemDetail<SaleInfo[]>;
  imageUrl: string;
  itemClass: string;
  itemSubClass: string;
  category: string;
  subCategory: ItemDetail<string>;
  productType: ItemDetail<string>;
  material: ItemDetail<string>;
  like: number;
  description: string;
  createdAt: string;
}

interface ItemDocumentWithBrandInfo {
  item: ItemDocument;
  brandName: string;
  brandLogoImageUrl: string;
}

interface Item {
  category: string;
  isDecoded: boolean;
  item: ItemDocumentWithBrandInfo;
  position: {
    top: string;
    left: string;
  };
}

interface ImageDocument {
  docId: string;
  decodedNum: Number;
  description: string;
  imgUrl: string;
  items: Record<string, Item[]>;
  like: Number;
  source?: string;
  style: string[];
  title: string;
  uploadBy: string;
}

interface ArtistDocument {
  id: string;
  name: Record<string, string>;
  category: string;
  profileImageUrl: string;
}

interface ItemCategory<M extends MainCategory = MainCategory> {
  main: M;
  sub: SubCategoryMap<M>;
  instance: InstanceMap<M, SubCategoryMap<M>>;
}

interface ProvideData {
  docId?: string;
  name?: string;
  brand?: string;
  saleUrl?: string;
  subCategory?: string;
  productType?: string;
  material?: string;
  designedBy?: string;
}

interface BrandData {
  en: string;
  ko: string;
  docId: string;
  logoImageUrl: string;
}

interface ProvideInfo<T> {
  who: string;
  value: T;
  provideStatus: ProvideStatus;
}

interface ProvideItemInfoWithMetadata {
  itemDocId: string;
  isImage: boolean;
  brandName: string;
  provideItemInfo: ProvideItemInfo;
}

interface FinalizeItemRequest {
  itemDocId: string;
  base64Image?: string;
  resetFields?: string[];
  finalizeFields: string[];
  saleInfoUrls?: string[];
  resetSaleInfoUrls?: string[];
}

interface ProvideItemInfo {
  name?: ProvideInfo<string>;
  brand?: ProvideInfo<string>;
  subCategory?: ProvideInfo<string>;
  productType?: ProvideInfo<string>;
  saleInfo?: ProvideInfo<string>[];
  material?: ProvideInfo<string>;
  designedBy?: ProvideInfo<string>;
}

interface ProvidedItemDetail {
  itemDocId: string;
  position: Position;
  provideItemInfo: ProvideItemInfo;
}

interface ItemRequest {
  imageDocId: string | null;
  imageUrl: string | null;
  isRequested: boolean;
  items: ProvidedItemDetail[] | null;
}