import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId | null;
  productCount: number;
  isActive: boolean;
  imageUrl?: string;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
