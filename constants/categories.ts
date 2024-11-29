
export type ItemClass = "Fashion" | "Furniture" | "Art";

export type ItemSubClass = 
  | "Clothing" 
  | "Accessories" 
  | "Sneakers"
  | "Chair" 
  | "Table" 
  | "Lighting"
  | "Painting" 
  | "Sculpture" 
  | "Photography";

export const subClassesByClass: Record<ItemClass, ItemSubClass[]> = {
  Fashion: ["Clothing", "Accessories", "Sneakers"],
  Furniture: ["Chair", "Table", "Lighting"],
  Art: ["Painting", "Sculpture", "Photography"],
};

export const categoriesBySubClass: Record<ItemSubClass, string[]> = {
  Clothing: ["Top", "Bottom", "Outer"],
  Accessories: ["Bags", "Jewelry", "Belts", "Hats", "Glasses"],
  Sneakers: ["Athletic", "Casual", "Limited"],
  Chair: ["Dining", "Office", "Lounge"],
  Table: ["Dining", "Coffee", "Side"],
  Lighting: ["Ceiling", "Table", "Floor"],
  Painting: ["Abstract", "Portrait", "Landscape"],
  Sculpture: ["Modern", "Classical", "Contemporary"],
  Photography: ["Nature", "Portrait", "Street"]
};

export const styleOptions = [
  "Casual",
  "Formal",
  "Street",
  "Sporty",
  "Vintage",
  "Minimal",
  "Bohemian",
  "Luxury",
  "Modern",
  "Classic",
] as const;
