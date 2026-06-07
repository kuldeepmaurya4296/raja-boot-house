// Data collection: vendors
export interface Vendor {
  id: string; name: string; tagline: string; email: string; joinedAt: string;
  productsCount: number; revenue: number; rating: number; payoutsPending: number; status: "active" | "pending";
}

export const vendors: Vendor[] = [
  { id: "v1", name: "Raja Atelier", tagline: "House-line craftsmen since 1972", email: "atelier@raja.com", joinedAt: "1972-01-01", productsCount: 24, revenue: 184200, rating: 4.9, payoutsPending: 4280, status: "active" },
  { id: "v2", name: "Highland Forge", tagline: "Rugged work & utility boots", email: "ops@highland.co", joinedAt: "2019-05-12", productsCount: 18, revenue: 92840, rating: 4.7, payoutsPending: 1840, status: "active" },
  { id: "v3", name: "Sahara & Co.", tagline: "Soft suede, soft soles", email: "hello@sahara.co", joinedAt: "2021-09-30", productsCount: 12, revenue: 48200, rating: 4.6, payoutsPending: 920, status: "active" },
];

export const currentVendor = vendors[1];
