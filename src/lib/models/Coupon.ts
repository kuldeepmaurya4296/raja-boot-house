import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "Flat" | "Percentage" | "Free Shipping";
  value: number;
  minCartValue: number;
  validFrom: Date;
  validTill: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    type: { type: String, enum: ["Flat", "Percentage", "Free Shipping"], required: true },
    value: { type: Number, required: true }, // amount in INR or percentage
    minCartValue: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validTill: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
