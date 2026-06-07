// Data collection: categories
export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  productCount: number;
}

export const categories: Category[] = [
  { id: "c1", slug: "chelsea", name: "Chelsea Boots", description: "Sleek, timeless silhouettes for everyday refinement.", productCount: 24 },
  { id: "c2", slug: "work", name: "Work Boots", description: "Rugged construction built to outlast the job.", productCount: 18 },
  { id: "c3", slug: "dress", name: "Dress Boots", description: "Polished leather for boardrooms and beyond.", productCount: 12 },
  { id: "c4", slug: "desert", name: "Desert Boots", description: "Soft suede classics with crepe soles.", productCount: 9 },
  { id: "c5", slug: "riding", name: "Riding Boots", description: "Equestrian heritage, tall leather profiles.", productCount: 7 },
  { id: "c6", slug: "womens", name: "Women's", description: "Heeled, ankle, and statement boots.", productCount: 21 },
];
