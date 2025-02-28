/**
 * The ArtistInfo interface defines the structure for artist information.
 * @param name The name of the artist.
 * @param category The category of the artist.
 * @param also_known_as Optional array of other names the artist is known by.
 * @param group Optional group the artist belongs to.
 * @param sns Optional record of social media links, with string keys and values.
 * @param tags Optional record of tags related to the artist, with string keys and values.
 */
export interface IdentityInfo {
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
   * @example "https://example.com/image.jpg"
   */
  profileImageUrl?: string;
  /**
   * @example { "instagram": "https://www.instagram.com/jennie/", "twitter": "https://twitter.com/jennie" }
   */
  linkInfo?: LinkInfo[];
}

export interface LinkInfo {
  value: string;
  label?: string;
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

export interface BrandInfo {
  name: Record<string, string>;
  logoImageUrl?: string;
  linkInfo?: LinkInfo[];
}

interface RequestedItem {
  position?: Position;
  context?: string;
  itemClass?: string;
  itemSubClass?: string;
  category?: string;
  subCategory?: string;
  productType?: string;
}

interface RequestImage {
  requestedItems: RequestedItem[];
  requestBy: string;
  imageFile?: string;
  metadata: Record<string, string>;
}

interface Point {
  x: number;
  y: number;
  context?: string;
}

interface ItemMetadata {
  name?: string;
  description?: string;
  brand?: string;
  designedBy?: string;
  material?: string;
  color?: string;
  itemClass?: string;
  itemSubClass?: string;
  category?: string;
  subCategory?: string;
  productType?: string;
}

interface LinkInfoWithProvider {
  provider: string;
  url: string;
  label: string;
}

interface ItemDocument {
  Id: string;
  requester: string;
  requestedAt: string;
  linkInfo?: LinkInfoWithProvider[];
  metadata: ItemMetadata;
  imgUrl: string;
  like: number;
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

interface IdentityDocument {
  id: string;
  name: Record<string, string>;
  category: string;
  profileImageUrl: string;
}

interface ProvideData {
  provider?: string;
  links?: string[];
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
}

interface PendingItem {
  itemDocId: string;
  imageDocId: string;
  pendingLinks?: string[];
}

interface AdditionalMetadata {
  name?: string;
  material?: string;
  designedBy?: string;
  color?: string;
  brand?: string;
  description?: string;
}

interface HasFields {
  hasImage?: boolean;
  hasBrand?: boolean;
  hasName?: boolean;
  hasMaterial?: boolean;
  hasDesignedBy?: boolean;
  hasColor?: boolean;
  hasDescription?: boolean;
}

interface ConfirmItemInfo {
  imageDocId?: string;
  base64Image?: string;
  approveUrls?: LinkInfo[];
  rejectUrls?: string[];
  additionalMetadata?: AdditionalMetadata;
}

interface ProvideItemInfo {
  brand?: string;
  links?: ProvideInfo<string>[];
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

export interface Category {
  name: string;
  children?: Category[];
  is_leaf: boolean;
  instances?: string[];
}

export interface CategoryDoc {
  item_class: string;
  depth: number;
  inner?: Category[];
}

export interface MetadataResponse {
  product_name?: string;
  material?: string;
  price?: number;
  currency?: string;
  brand?: string;
}

export interface ItemWithIdentity {
  identity_doc_id?: string;
  identity_name?: string;
  item?: RequestedItem;
}

export interface BrandDoc {
  name: Record<string, string>;
  docId: string;
}
