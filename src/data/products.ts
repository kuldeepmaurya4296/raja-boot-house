// Data collection: products
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  vendorId: string;
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  colors: string[];
  sizes: number[];
  stock: number;
  rating: number;
  reviewsCount: number;
  badge?: "new" | "bestseller" | "sale";
  createdAt: string;
}

export const products: Product[] = [
  {
    id: "p1", slug: "raja-oxblood-chelsea", name: "Raja Oxblood Chelsea",
    category: "chelsea", vendorId: "v1", price: 289, compareAt: 340,
    image: p1.src, gallery: [p1.src, p2.src, p3.src],
    description: "Hand-stitched chelsea boot in vegetable-tanned oxblood calfskin. Built on our signature Raja last for a refined, snug fit.",
    details: ["Full-grain Italian calfskin", "Goodyear welted leather sole", "Elastic gusset for slip-on ease", "Brass pull tab"],
    colors: ["Oxblood", "Black"], sizes: [7, 8, 9, 10, 11, 12],
    stock: 24, rating: 4.8, reviewsCount: 142, badge: "bestseller",
    createdAt: "2025-03-12",
  },
  {
    id: "p2", slug: "highland-cognac-work", name: "Highland Cognac Work Boot",
    category: "work", vendorId: "v2", price: 349,
    image: p2.src, gallery: [p2.src, p3.src, p1.src],
    description: "Six-eyelet work boot with lugged Vibram sole. For long days and longer roads.",
    details: ["Oiled cognac leather", "Vibram lugged outsole", "Triple-stitched welt", "Padded leather collar"],
    colors: ["Cognac", "Brown"], sizes: [8, 9, 10, 11, 12, 13],
    stock: 18, rating: 4.9, reviewsCount: 89, badge: "new",
    createdAt: "2025-05-02",
  },
  {
    id: "p3", slug: "noir-cap-toe-derby", name: "Noir Cap-Toe Derby",
    category: "dress", vendorId: "v1", price: 419,
    image: p3.src, gallery: [p3.src, p1.src, p2.src],
    description: "A boardroom essential. Polished black calfskin derby with hand-burnished cap toe.",
    details: ["Mirror-finished calfskin", "Leather lined", "Blake-stitched construction", "Stacked leather heel"],
    colors: ["Black"], sizes: [7, 8, 9, 10, 11],
    stock: 11, rating: 4.7, reviewsCount: 56,
    createdAt: "2025-01-18",
  },
  {
    id: "p4", slug: "sahara-suede-desert", name: "Sahara Suede Desert",
    category: "desert", vendorId: "v3", price: 219, compareAt: 260,
    image: p4.src, gallery: [p4.src, p2.src, p1.src],
    description: "Soft Italian suede over a natural crepe sole. The original weekend boot.",
    details: ["Premium Italian suede", "Natural crepe sole", "Two-eyelet lacing", "Cotton drill lining"],
    colors: ["Espresso", "Sand", "Olive"], sizes: [7, 8, 9, 10, 11, 12],
    stock: 32, rating: 4.6, reviewsCount: 211, badge: "sale",
    createdAt: "2024-11-04",
  },
  {
    id: "p5", slug: "stallion-riding-tall", name: "Stallion Tall Riding",
    category: "riding", vendorId: "v2", price: 489,
    image: p5.src, gallery: [p5.src, p2.src, p3.src],
    description: "Equestrian heritage in tall, glove-soft leather. Knee-high with leather strap detail.",
    details: ["Single-piece leather upper", "Knee-high shaft", "Leather sole with rubber insert", "Hand-finished edges"],
    colors: ["Chestnut", "Black"], sizes: [6, 7, 8, 9, 10],
    stock: 7, rating: 4.9, reviewsCount: 38,
    createdAt: "2025-04-22",
  },
  {
    id: "p6", slug: "monarch-heeled-ankle", name: "Monarch Heeled Ankle",
    category: "womens", vendorId: "v3", price: 269,
    image: p6.src, gallery: [p6.src, p1.src, p4.src],
    description: "A 70mm stacked heel ankle boot in soft tan leather. Modern silhouette, classic craft.",
    details: ["Soft tan calfskin", "70mm stacked wood heel", "Side zip", "Leather lined"],
    colors: ["Tan", "Black", "Cream"], sizes: [5, 6, 7, 8, 9, 10],
    stock: 14, rating: 4.8, reviewsCount: 97, badge: "new",
    createdAt: "2025-05-20",
  },
  {
    id: "p7", slug: "raja-noir-chelsea", name: "Raja Noir Chelsea",
    category: "chelsea", vendorId: "v1", price: 289,
    image: p3.src, gallery: [p3.src, p1.src],
    description: "The Raja Chelsea in deep black calfskin. An understated icon.",
    details: ["Full-grain calfskin", "Goodyear welt", "Brass pull tab"],
    colors: ["Black"], sizes: [7, 8, 9, 10, 11, 12],
    stock: 20, rating: 4.7, reviewsCount: 64,
    createdAt: "2025-02-11",
  },
  {
    id: "p8", slug: "forge-iron-work", name: "Forge Iron Work Boot",
    category: "work", vendorId: "v2", price: 399,
    image: p2.src, gallery: [p2.src, p4.src],
    description: "Steel-toe construction boot. Built for the forge, dressed for the city.",
    details: ["Steel toe cap", "Oil-resistant lugged sole", "Heat-resistant leather", "Reinforced ankle"],
    colors: ["Cognac"], sizes: [8, 9, 10, 11, 12, 13],
    stock: 9, rating: 4.8, reviewsCount: 42, badge: "bestseller",
    createdAt: "2024-12-30",
  },
];

export const featuredProducts = () => products.filter((p) => p.badge === "bestseller" || p.badge === "new");
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
export const productsByCategory = (cat: string) => products.filter((p) => p.category === cat);
