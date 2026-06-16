import mongoose, { Schema, Document } from "mongoose";

export interface IVariant {
  size: number;
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
  images?: { url: string; public_id: string }[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  brand: mongoose.Types.ObjectId | string;
  category: mongoose.Types.ObjectId;
  gender: "Men" | "Women" | "Children" | "Unisex";
  occasion: ("Daily" | "Wedding" | "Bridal" | "Party" | "Function" | "Sports")[];
  images: { url: string; public_id: string }[];
  variants: IVariant[];
  price: number;
  salePrice: number;
  discount: number; // percentage
  returnDays?: number;
  rating: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema({
  size: { type: Number, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
});

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    gender: { type: String, enum: ["Men", "Women", "Children", "Unisex"], required: true, index: true },
    occasion: [{ type: String, enum: ["Daily", "Wedding", "Bridal", "Party", "Function", "Sports"], index: true }],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    variants: [VariantSchema],
    price: { type: Number, required: true }, // MRP
    salePrice: { type: Number, required: true }, // Actual selling price
    discount: { type: Number, default: 0 }, // Discount % auto-calculated or stored
    returnDays: { type: Number, default: 7 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    tags: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to calculate discount percentage
ProductSchema.pre("save", function (this: any) {
  if (this.price && this.salePrice) {
    this.discount = Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
