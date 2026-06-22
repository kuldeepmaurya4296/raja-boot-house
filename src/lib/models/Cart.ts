import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image: string;
  size: number;
  color: string;
  quantity: number;
  slug: string;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true },
  slug: { type: String, required: true },
});

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: [CartItemSchema],
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
