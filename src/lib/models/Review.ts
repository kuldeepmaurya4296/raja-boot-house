import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String },
    images: [{ type: String }], // Vercel Blob URLs
    isApproved: { type: Boolean, default: false, index: true },
    isVerifiedPurchase: { type: Boolean, default: false, index: true },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index to ensure a user can review a product only once
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
