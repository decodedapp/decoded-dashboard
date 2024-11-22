import type { ItemClass, ItemCategory } from '../types/model';

export const categoryByClass: Record<ItemClass, ItemCategory[]> = {
  Fashion: ["Clothing", "Accessories", "Sneakers"],
  Furniture: ["Chair", "Table", "Lighting"],
  Art: ["Painting", "Sculpture", "Photography"],
};