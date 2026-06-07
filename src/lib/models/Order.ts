import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  size: number;
  color: string;
  price: number;
  qty: number;
}

export interface IOrderHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pin: string;
    country: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    couponDiscount: number;
    total: number;
  };
  coupon?: {
    code: string;
    discountAmount: number;
  };
  payment: {
    method: "UPI" | "Card" | "Net Banking" | "Wallet" | "COD";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  };
  status: "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";
  statusHistory: IOrderHistory[];
  shipping?: {
    courier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
});

const StatusHistorySchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pin: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true, default: 0 },
      couponDiscount: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
    },
    coupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    payment: {
      method: { type: String, enum: ["UPI", "Card", "Net Banking", "Wallet", "COD"], required: true },
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String },
      status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING", index: true },
    },
    status: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"],
      default: "PLACED",
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    shipping: {
      courier: { type: String },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
