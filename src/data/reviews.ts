// Data collection: reviews
export interface Review { id: string; productId: string; userName: string; rating: number; title: string; body: string; createdAt: string; verified: boolean; }

export const reviews: Review[] = [
  { id: "r1", productId: "p1", userName: "Aarav S.", rating: 5, title: "Worth every rupee", body: "The leather has aged beautifully after six months. Comfortable from day one.", createdAt: "2025-04-12", verified: true },
  { id: "r2", productId: "p1", userName: "Karan D.", rating: 5, title: "Modern classic", body: "Fits true to size. The oxblood color is even richer in person.", createdAt: "2025-03-22", verified: true },
  { id: "r3", productId: "p1", userName: "Priya R.", rating: 4, title: "Solid boot", body: "Took a week to break in but now they feel like slippers.", createdAt: "2025-02-18", verified: true },
  { id: "r4", productId: "p2", userName: "Rohan V.", rating: 5, title: "Tank-built", body: "I work on a construction site. These have held up beautifully.", createdAt: "2025-05-01", verified: true },
];

export const reviewsByProduct = (pid: string) => reviews.filter(r => r.productId === pid);
