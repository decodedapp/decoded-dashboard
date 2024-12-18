
// Clothing
export type TopSubCategory = keyof typeof Tops;
export type TopInstance<T extends TopSubCategory> = typeof Tops[T][number];
export type BottomCategory = keyof typeof Bottoms;
export type BottomSubCategory<T extends BottomCategory> = typeof Bottoms[T][number];
export type OuterwearCategory = keyof typeof Outerwear;
export type OuterwearSubCategory<T extends OuterwearCategory> = typeof Outerwear[T][number];
export type OnePieceCategory = keyof typeof OnePiece;
export type OnePieceSubCategory<T extends OnePieceCategory> = typeof OnePiece[T][number];
export type UnderwearCategory = keyof typeof Underwear;
export type UnderwearSubCategory<T extends UnderwearCategory> = typeof Underwear[T][number];
export type SportswearCategory = keyof typeof Sportswear;
export type SportswearSubCategory<T extends SportswearCategory> = typeof Sportswear[T][number];
export type SwimwearCategory = keyof typeof Swimwear;
export type SwimwearSubCategory<T extends SwimwearCategory> = typeof Swimwear[T][number];

// Accessories
export type HatsCategory = keyof typeof Hats;
export type HatsSubCategory<T extends HatsCategory> = typeof Hats[T][number];
export type HairAccessoriesCategory = keyof typeof HairAccessories;
export type HairAccessoriesSubCategory<T extends HairAccessoriesCategory> = typeof HairAccessories[T][number];
export type EyewearCategory = keyof typeof Eyewear;
export type EyewearSubCategory<T extends EyewearCategory> = typeof Eyewear[T][number];
export type JewelryCategory = keyof typeof Jewelry;
export type JewelrySubCategory<T extends JewelryCategory> = typeof Jewelry[T][number];
export type NeckwearCategory = keyof typeof Neckwear;
export type NeckwearSubCategory<T extends NeckwearCategory> = typeof Neckwear[T][number];
export type BeltsCategory = keyof typeof Belts;
export type BeltsSubCategory<T extends BeltsCategory> = typeof Belts[T][number];
export type GlovesCategory = keyof typeof Gloves;
export type GlovesSubCategory<T extends GlovesCategory> = typeof Gloves[T][number];
export type WatchesCategory = keyof typeof Watches;
export type WatchesSubCategory<T extends WatchesCategory> = typeof Watches[T][number];
export type SocksCategory = keyof typeof Socks;
export type SocksSubCategory<T extends SocksCategory> = typeof Socks[T][number];
export type SmallLeatherGoodsCategory = keyof typeof SmallLeatherGoods;
export type SmallLeatherGoodsSubCategory<T extends SmallLeatherGoodsCategory> = typeof SmallLeatherGoods[T][number];
export type TechAccessoriesCategory = keyof typeof TechAccessories;
export type TechAccessoriesSubCategory<T extends TechAccessoriesCategory> = typeof TechAccessories[T][number];
export type OthersCategory = keyof typeof Others;
export type OthersSubCategory<T extends OthersCategory> = typeof Others[T][number];

// Sneakers
export type SneakersCategory = keyof typeof Sneakers;
export type SneakersSubCategory<T extends SneakersCategory> = typeof Sneakers[T][number];
export type BootsCategory = keyof typeof Boots;
export type BootsSubCategory<T extends BootsCategory> = typeof Boots[T][number];
export type FlatShoesCategory = keyof typeof FlatShoes;
export type FlatShoesSubCategory<T extends FlatShoesCategory> = typeof FlatShoes[T][number];
export type SandalsCategory = keyof typeof Sandals;
export type SandalsSubCategory<T extends SandalsCategory> = typeof Sandals[T][number];
export type FormalShoesCategory = keyof typeof FormalShoes;
export type FormalShoesSubCategory<T extends FormalShoesCategory> = typeof FormalShoes[T][number];
export type HeelsCategory = keyof typeof Heels;
export type HeelsSubCategory<T extends HeelsCategory> = typeof Heels[T][number];

// Bags
export type BackpacksCategory = keyof typeof Backpacks;
export type BackpacksSubCategory<T extends BackpacksCategory> = typeof Backpacks[T][number];
export type ShoulderBagsCategory = keyof typeof ShoulderBags;
export type ShoulderBagsSubCategory<T extends ShoulderBagsCategory> = typeof ShoulderBags[T][number];
export type HandbagsCategory = keyof typeof Handbags;
export type HandbagsSubCategory<T extends HandbagsCategory> = typeof Handbags[T][number];
export type BusinessBagsCategory = keyof typeof BusinessBags;
export type BusinessBagsSubCategory<T extends BusinessBagsCategory> = typeof BusinessBags[T][number];
export type LuggageCategory = keyof typeof Luggage;
export type LuggageSubCategory<T extends LuggageCategory> = typeof Luggage[T][number];
export type SmallBagsCategory = keyof typeof SmallBags;
export type SmallBagsSubCategory<T extends SmallBagsCategory> = typeof SmallBags[T][number];

// Furniture
export type ChairCategory = keyof typeof Chair;
export type ChairSubCategory<T extends ChairCategory> = typeof Chair[T][number];
export type TableCategory = keyof typeof Table;
export type TableSubCategory<T extends TableCategory> = typeof Table[T][number];
export type LightingCategory = keyof typeof Lighting;
export type LightingSubCategory<T extends LightingCategory> = typeof Lighting[T][number];

// Art
export type PaintingCategory = keyof typeof Painting;
export type PaintingSubCategory<T extends PaintingCategory> = typeof Painting[T][number];
export type SculptureCategory = keyof typeof Sculpture;
export type SculptureSubCategory<T extends SculptureCategory> = typeof Sculpture[T][number];
export type PhotographyCategory = keyof typeof Photography;
export type PhotographySubCategory<T extends PhotographyCategory> = typeof Photography[T][number];

export type ItemClass = "fashion" | "furniture" | "art";
export type ItemSubClass = 
  | "clothing" 
  | "accessories" 
  | "sneakers"
  | "bags"
  | "chair" 
  | "table" 
  | "lighting"
  | "painting" 
  | "sculpture" 
  | "photography";

export type ClothingCategories = "top" | "bottom" | "outer" | "one-piece" | "underwear" | "sportswear" | "swimwear";
export type AccessoriesCategories = "bags" | "jewelry" | "belts" | "hats" | "glasses";
export type SneakersCategories = "sneakers" | "boots" | "flat-shoes" | "sandals" | "formal-shoes" | "heels";
export type BagsCategories = "backpacks" | "shoulder-bags" | "handbags" | "business-bags" | "luggage" | "small-bags";
export type FurnitureCategories = "chair" | "table" | "lighting";
export type ArtCategories = "painting" | "sculpture" | "photography";

// 메인 카테고리 타입
export type MainCategory =
  // Clothing
  ClothingCategories
  | AccessoriesCategories
  | SneakersCategories
  | BagsCategories
  | FurnitureCategories
  | ArtCategories;

// 메인 카테고리에 따른 서브카테고리 매핑
export type SubCategoryMap<M extends MainCategory> = 
  // Clothing
  M extends "top" ? TopSubCategory :
  M extends "bottom" ? BottomCategory :
  M extends "outerwear" ? OuterwearCategory :
  M extends "onepiece" ? OnePieceCategory :
  M extends "underwear" ? UnderwearCategory :
  M extends "sportswear" ? SportswearCategory :
  M extends "swimwear" ? SwimwearCategory :
  // Accessories
  M extends "hats" ? HatsCategory :
  M extends "hair-accessories" ? HairAccessoriesCategory :
  M extends "eyewear" ? EyewearCategory :
  M extends "jewelry" ? JewelryCategory :
  M extends "neckwear" ? NeckwearCategory :
  M extends "belts" ? BeltsCategory :
  M extends "gloves" ? GlovesCategory :
  M extends "watches" ? WatchesCategory :
  M extends "socks" ? SocksCategory :
  M extends "small-leather-goods" ? SmallLeatherGoodsCategory :
  M extends "tech-accessories" ? TechAccessoriesCategory :
  M extends "others" ? OthersCategory :
  // Shoes
  M extends "sneakers" ? SneakersCategory :
  M extends "boots" ? BootsCategory :
  M extends "flatshoes" ? FlatShoesCategory :
  M extends "sandals" ? SandalsCategory :
  M extends "formal-shoes" ? FormalShoesCategory :
  M extends "heels" ? HeelsCategory :
  // Bags
  M extends "backpacks" ? BackpacksCategory :
  M extends "shoulder-bags" ? ShoulderBagsCategory :
  M extends "handbags" ? HandbagsCategory :
  M extends "business-bags" ? BusinessBagsCategory :
  M extends "luggage" ? LuggageCategory :
  M extends "small-bags" ? SmallBagsCategory :
  M extends "chair" ? ChairCategory :
  M extends "table" ? TableCategory :
  M extends "lighting" ? LightingCategory :
  M extends "painting" ? PaintingCategory :
  M extends "sculpture" ? SculptureCategory :
  M extends "photography" ? PhotographyCategory :

  never;

// 서브카테고리에 따른 인스턴스 매핑
export type InstanceMap<M extends MainCategory, S extends SubCategoryMap<M>> = 
  // Clothing
  M extends "top" ? TopInstance<S & TopSubCategory> :
  M extends "bottom" ? BottomSubCategory<S & BottomCategory> :
  M extends "outerwear" ? OuterwearSubCategory<S & OuterwearCategory> :
  M extends "onepiece" ? OnePieceSubCategory<S & OnePieceCategory> :
  M extends "underwear" ? UnderwearSubCategory<S & UnderwearCategory> :
  M extends "sportswear" ? SportswearSubCategory<S & SportswearCategory> :
  M extends "swimwear" ? SwimwearSubCategory<S & SwimwearCategory> :
  // Accessories
  M extends "hats" ? HatsSubCategory<S & HatsCategory> :
  M extends "hairaccessories" ? HairAccessoriesSubCategory<S & HairAccessoriesCategory> :
  M extends "eyewear" ? EyewearSubCategory<S & EyewearCategory> :
  M extends "jewelry" ? JewelrySubCategory<S & JewelryCategory> :
  M extends "neckwear" ? NeckwearSubCategory<S & NeckwearCategory> :
  M extends "belts" ? BeltsSubCategory<S & BeltsCategory> :
  M extends "gloves" ? GlovesSubCategory<S & GlovesCategory> :
  M extends "watches" ? WatchesSubCategory<S & WatchesCategory> :
  M extends "socks" ? SocksSubCategory<S & SocksCategory> :
  M extends "small-leather-goods" ? SmallLeatherGoodsSubCategory<S & SmallLeatherGoodsCategory> :
  M extends "tech-accessories" ? TechAccessoriesSubCategory<S & TechAccessoriesCategory> :
  M extends "others" ? OthersSubCategory<S & OthersCategory> :
  // Shoes
  M extends "sneakers" ? SneakersSubCategory<S & SneakersCategory> :
  M extends "boots" ? BootsSubCategory<S & BootsCategory> :
  M extends "flat-shoes" ? FlatShoesSubCategory<S & FlatShoesCategory> :
  M extends "sandals" ? SandalsSubCategory<S & SandalsCategory> :
  M extends "formalshoes" ? FormalShoesSubCategory<S & FormalShoesCategory> :
  M extends "heels" ? HeelsSubCategory<S & HeelsCategory> :
  // Bags
  M extends "backpacks" ? BackpacksSubCategory<S & BackpacksCategory> :
  M extends "shoulder-bags" ? ShoulderBagsSubCategory<S & ShoulderBagsCategory> :
  M extends "handbags" ? HandbagsSubCategory<S & HandbagsCategory> :
  M extends "business-bags" ? BusinessBagsSubCategory<S & BusinessBagsCategory> :
  M extends "luggage" ? LuggageSubCategory<S & LuggageCategory> :
  M extends "small-bags" ? SmallBagsSubCategory<S & SmallBagsCategory> :
  M extends "chair" ? ChairSubCategory<S & ChairCategory> :
  M extends "table" ? TableSubCategory<S & TableCategory> :
  M extends "lighting" ? LightingSubCategory<S & LightingCategory> :
  M extends "painting" ? PaintingSubCategory<S & PaintingCategory> :
  M extends "sculpture" ? SculptureSubCategory<S & SculptureCategory> :
  M extends "photography" ? PhotographySubCategory<S & PhotographyCategory> :

  never;

export const subClassesByClass: Record<ItemClass, ItemSubClass[]> = {
  fashion: ["clothing", "accessories", "sneakers"],
  furniture: ["chair", "table", "lighting"],
  art: ["painting", "sculpture", "photography"],
};

export const categoriesBySubClass: Record<ItemSubClass, string[]> = {
  clothing: ["top", "bottom", "outer", "one-piece", "underwear", "sportswear", "swimwear"],
  accessories: ["bags", "jewelry", "belts", "hats", "glasses"],
  sneakers: ["sneakers", "boots", "flat-shoes", "sandals", "formal-shoes", "heels"],
  bags: ["backpacks", "shoulder-bags", "handbags", "business-bags", "luggage", "small-bags"],
  chair: ["dining", "office", "lounge", "living", "bedroom"],
  table: ["dining", "coffee", "side", "living", "bedroom"],
  lighting: ["ceiling", "table", "floor", "living", "bedroom"],
  painting: ["abstract", "portrait", "landscape", "still-life", "art-movement"],
  sculpture: ["modern", "classical", "contemporary", "sculpture-movement"],
  photography: ["nature", "portrait", "street", "art-movement"]
};

// Clothing
export const Tops = {
  "t-shirts": [
    "basic-tee",          
    "polo-shirt",        
    "henley-shirt"      
  ],
  "sleeveless": [
    "tank-top",         
    "sleeveless-top",    
    "bodysuit"          
  ],
  "shirts": [
    "dress-shirt",       
    "casual-shirt",      
    "oxford-shirt",      
    "linen-shirt",        
    "denim-shirt"
  ],
  "sweatshirts": [
    "crew-sweatshirt",    
    "graphic-sweatshirt", 
    "fleece-sweatshirt",
    "half-zip-sweatshirt"
  ],
  "hoodies": [    
    "pullover-hoodie",    
    "zip-up-hoodie",      
    "oversized-hoodie",   
    "cropped-hoodie"     
  ],
  "knitwear": [
    "cardigan",           
    "pullover-sweater",  
    "turtleneck-sweater", 
    "v-neck-sweater",     
    "crewneck-sweater"    
  ]
} as const;

export const Bottoms = {
  "pants": [
    "straight-pants",    
    "wide-pants",         
    "slim-pants",        
    "cargo-pants",        
    "denim-pants",       
    "leather-pants",     
    "sweatpants"         
  ],
  "shorts": [
    "denim-shorts",      
    "chino-shorts",      
    "cargo-shorts",       
    "athletic-shorts"     
  ],
  "skirts": [
    "mini-skirt",         
    "midi-skirt",         
    "maxi-skirt",         
    "pleated-skirt",      
    "a-line-skirt"        
  ]
} as const;

export const Outerwear = {
  "jackets": [
    "bomber-jacket",      
    "denim-jacket",       
    "leather-jacket",     
    "track-jacket",       
    "varsity-jacket",     
    "field-jacket"        
  ],
  "blazers": [
    "casual-blazer",      
    "formal-blazer",      
    "oversized-blazer",   
    "cropped-blazer"      
  ],
  "coats": [
    "wool-coat",          
    "trench-coat",        
    "duffle-coat",        
    "peacoat",            
    "mac-coat"            
  ],
  "paddings": [
    "down-jacket",        
    "puffer-jacket",      
    "padded-coat",        
    "parka"               
  ]
} as const;

export const OnePiece = {
  "dresses": [
    "mini-dress",
    "midi-dress",
    "maxi-dress",
    "slip-dress",
    "shirt-dress"
  ],
  "jumpsuits": [
    "casual-jumpsuit",
    "formal-jumpsuit", 
    "overall",
    "romper"
  ],
  "special": [
    "swimsuit",
    "bikini",
    "athletic-set",
    "suit-set"
  ]
} as const;

export const Underwear = {
  "tops": [
    "bra",
    "bralette",
    "sports-bra",
    "camisole",
    "undershirt"
  ],
  "bottoms": [
    "brief",
    "boxer",
    "trunk",
    "panty",
    "thong"
  ],
  "sets": [
    "pajama-set",
    "loungewear-set",
    "thermal-set"
  ]
} as const;

export const Sportswear = {
  "tops": [
    "compression-shirt",
    "tank-top",
    "sports-tee",
    "jersey",
    "rashguard"
  ],
  "bottoms": [
    "leggings",
    "shorts",
    "compression-pants",
    "track-pants",
    "yoga-pants"
  ],
  "outerwear": [
    "track-jacket",
    "windbreaker",
    "sports-hoodie",
    "training-vest"
  ]
} as const;

export const Swimwear = {
  "one-piece": [
    "classic-swimsuit",
    "sports-swimsuit",
    "cut-out-swimsuit",
    "rashguard-suit"
  ],
  "two-piece": [
    "bikini-set",
    "tankini-set",
    "swim-shorts-set",
    "athletic-set"
  ],
  "cover-ups": [
    "beach-dress",
    "kaftan",
    "beach-pants",
    "swim-robe"
  ]
} as const;


// Accessories
export const Hats = {
  "casual": [
    "baseball-cap",
    "beanie",
    "bucket-hat"
  ],
  "formal": [
    "derby-hat",
    "fedora",
    "panama-hat",
    "aviator-cap"
  ]
} as const;

export const HairAccessories = {
  "bands": [
    "headband",
    "hair-clip", 
    "scrunchie"
  ],
  "ties": [
    "hair-tie"
  ]
} as const;

export const Eyewear = {
  "eyewear": [
    "sunglasses",
    "optical-glasses",
    "sports-glasses"
  ]
} as const;

export const Jewelry = {
  "jewelry": [
    "necklace",
    "bracelet",
    "ring",
    "earring",
    "brooch",
    "pin"
  ]
} as const;

export const Neckwear = {
  "neckwear": [
    "scarf",
    "neck-tie",
    "bow-tie",
    "tie-bar"
  ]
} as const;

export const Belts = {
  "belts": [
    "leather-belt",
    "fabric-belt",
    "suspender"
  ]
} as const;

export const Gloves = {
  "gloves": [
    "leather-gloves",
    "knit-gloves",
    "sports-gloves"
  ]
} as const;

export const Watches = {
  "watches": [
    "analog-watch",
    "digital-watch",
    "smartwatch",
    "sports-watch"
  ]
} as const;

export const Socks = {
  "socks": [
    "ankle-socks",
    "crew-socks",
    "dress-socks",
    "sports-socks"
  ]
} as const;

export const SmallLeatherGoods = {
  "small-leather-goods": [
    "wallet",
    "card-holder",
    "passport-holder",
    "keychain",
    "coin-purse"
  ]
} as const;

export const TechAccessories = {
  "tech-accessories": [
    "phone-case",
    "laptop-case",
    "tablet-case",
    "airpods-case"
  ]
} as const;

export const Others = {
  "others": [
    "umbrella",
    "face-mask",
    "handkerchief",
    "pocket-square"
  ]
} as const;

// Sneakers
export const Sneakers = {
  "sneakers": [
    "high-top-sneaker",
    "low-top-sneaker",
    "slip-on-sneaker",
    "running-sneaker"
  ]
} as const;

export const Boots = {
  "boots": [
    "chelsea-boot",
    "combat-boot", 
    "desert-boot",
    "lace-up-boot",
    "zip-up-boot"
  ]
} as const;

export const FlatShoes = {
  "flat-shoes": [
    "oxford-shoe",
    "derby-shoe",
    "loafer",
    "moccasin", 
    "ballerina-flat",
    "espadrille"
  ]
} as const;

export const Sandals = {
  "sandals": [
    "sandals"
  ]
} as const;

export const FormalShoes = {
  "formal-shoes": [
    "monk-strap",
    "dress-oxford",
    "brogue",
    "wingtip"
  ]
} as const;

export const Heels = {
  "heels": [
    "pump",
    "stiletto",
    "block-heel",
    "kitten-heel",
    "platform-heel"
  ]
} as const;

export const Backpacks = {
  "backpacks": [
    "backpacks"
  ]
} as const;

export const ShoulderBags = {
  "shoulder-bags": [
    "crossbody-bag",
    "messenger-bag",
    "hobo-bag",
    "bucket-bag"
  ]
} as const;

export const Handbags = {
  "handbags": [
    "top-handle-bag",
    "satchel-bag",
    "tote-bag",
    "clutch-bag"
  ]
} as const;

export const BusinessBags = {
  "business-bags": [
    "business-bags"
  ]
} as const;

export const Luggage = {
  "luggage": [
    "duffle-bag",    
    "carrier"       
  ]
} as const;

export const SmallBags = {
  "small-bags": [
    "pouch",
    "mini-bag",
    "wallet-bag",
    "cosmetic-bag"
  ]
} as const;

// Bags
export const Bags = {
  "backpacks": Backpacks,
  "shoulder-bags": ShoulderBags,
  "handbags": Handbags,
  "business-bags": BusinessBags,
  "luggage": Luggage,
  "small-bags": SmallBags
} as const;

export const styleOptions = [
  "casual",
  "formal",
  "street",
  "sporty",
  "vintage",
  "minimal",
  "bohemian",
  "luxury",
  "modern",
  "classic",
] as const;

export const Chair = {
  "dining":["dining"],
  "office":["office"],
  "lounge":["lounge"],
  "living":["living"],
  "bedroom":["bedroom"]
} as const;

export const Table = {
  "table": [
    "dining",
    "coffee",
    "side",
    "living",
    "bedroom"
  ]
} as const;

export const Lighting = {
  "lighting": [
    "ceiling",
    "table",
    "floor"
  ]
} as const;

export const Painting = {
  "painting": [
    "abstract",
    "portrait",
    "landscape",
    "still-life",
    "art-movement"
  ]
} as const;

export const Sculpture = {
  "sculpture": [
    "modern",
    "classical",
    "contemporary"
  ]
} as const;

export const Photography = {
  "photography": [
    "nature",
    "portrait",
    "street",
    "art-movement"
  ]
} as const;

export const categories = {
  "top": Tops,
  "bottom": Bottoms,
  "outerwear": Outerwear,
  "onepiece": OnePiece,
  "underwear": Underwear,
  "sportswear": Sportswear,
  "swimwear": Swimwear,
  "hats": Hats,
  "bags": Bags,
  "hair-accessories": HairAccessories,
  "glasses": Eyewear,
  "jewelry": Jewelry,
  "neckwear": Neckwear,
  "belts": Belts,
  "gloves": Gloves,
  "watches": Watches,
  "socks": Socks,
  "small-leather-goods": SmallLeatherGoods,
  "tech-accessories": TechAccessories,
  "others": Others,
  "sneakers": Sneakers,
  "boots": Boots,
  "flat-shoes": FlatShoes,
  "sandals": Sandals,
  "formal-shoes": FormalShoes,
  "heels": Heels,
  "backpacks": Backpacks,
  "shoulder-bags": ShoulderBags,
  "handbags": Handbags,
  "business-bags": BusinessBags,
  "luggage": Luggage,
  "small-bags": SmallBags,
  "chair": Chair,
  "table": Table,
  "lighting": Lighting,
  "painting": Painting,
  "sculpture": Sculpture,
  "photography": Photography,
} as const;
