import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISaleItem {
  productId: Types.ObjectId;
  name: string;
  SKU: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

export interface ISale extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  paymentMode: "cash" | "card" | "mobile_money" | "other";
  amountReceived: number;
  change: number;
  profit: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  SKU: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const SaleSchema = new Schema<ISale>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    items: { type: [SaleItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "mobile_money", "other"],
      required: true,
    },
    amountReceived: { type: Number, default: 0, min: 0 },
    change: { type: Number, default: 0, min: 0 },
    profit: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ createdBy: 1 });

export const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
