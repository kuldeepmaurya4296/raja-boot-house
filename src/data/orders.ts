// Data collection: orders
export interface OrderItem { productId: string; name: string; size: number; color: string; quantity: number; price: number; image: string; }
export interface Order {
  id: string; number: string; userId: string; vendorId: string; createdAt: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number; subtotal: number; shipping: number; tax: number;
  items: OrderItem[]; address: string; payment: "card" | "upi" | "cod";
}

import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p4 from "@/assets/product-4.jpg";
import p6 from "@/assets/product-6.jpg";

export const orders: Order[] = [
  { id: "o1", number: "RBH-10421", userId: "u1", vendorId: "v1", createdAt: "2025-05-28", status: "delivered", total: 312, subtotal: 289, shipping: 0, tax: 23,
    items: [{ productId: "p1", name: "Raja Oxblood Chelsea", size: 10, color: "Oxblood", quantity: 1, price: 289, image: p1.src }],
    address: "12 Marine Drive, Mumbai 400020", payment: "card" },
  { id: "o2", number: "RBH-10422", userId: "u2", vendorId: "v2", createdAt: "2025-05-29", status: "shipped", total: 376, subtotal: 349, shipping: 0, tax: 27,
    items: [{ productId: "p2", name: "Highland Cognac Work Boot", size: 11, color: "Cognac", quantity: 1, price: 349, image: p2.src }],
    address: "Andheri West, Mumbai 400053", payment: "upi" },
  { id: "o3", number: "RBH-10423", userId: "u3", vendorId: "v3", createdAt: "2025-05-30", status: "processing", total: 237, subtotal: 219, shipping: 0, tax: 18,
    items: [{ productId: "p4", name: "Sahara Suede Desert", size: 9, color: "Espresso", quantity: 1, price: 219, image: p4.src }],
    address: "Connaught Place, New Delhi 110001", payment: "card" },
  { id: "o4", number: "RBH-10424", userId: "u4", vendorId: "v3", createdAt: "2025-05-30", status: "pending", total: 290, subtotal: 269, shipping: 0, tax: 21,
    items: [{ productId: "p6", name: "Monarch Heeled Ankle", size: 7, color: "Tan", quantity: 1, price: 269, image: p6.src }],
    address: "Indiranagar, Bangalore 560038", payment: "cod" },
  { id: "o5", number: "RBH-10425", userId: "u1", vendorId: "v2", createdAt: "2025-05-15", status: "delivered", total: 752, subtotal: 698, shipping: 0, tax: 54,
    items: [{ productId: "p2", name: "Highland Cognac Work Boot", size: 10, color: "Cognac", quantity: 2, price: 349, image: p2.src }],
    address: "12 Marine Drive, Mumbai 400020", payment: "card" },
  { id: "o6", number: "RBH-10426", userId: "u5", vendorId: "v1", createdAt: "2025-05-22", status: "delivered", total: 312, subtotal: 289, shipping: 0, tax: 23,
    items: [{ productId: "p1", name: "Raja Oxblood Chelsea", size: 9, color: "Oxblood", quantity: 1, price: 289, image: p1.src }],
    address: "Sector 17, Chandigarh 160017", payment: "card" },
];

export const ordersByUser = (uid: string) => orders.filter(o => o.userId === uid);
export const ordersByVendor = (vid: string) => orders.filter(o => o.vendorId === vid);
