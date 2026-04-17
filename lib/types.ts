export interface IProduct {
  _id: string;
  name: string;
  barcode?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type Product = IProduct;

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "cashier";
  createdAt: Date | string;
}

export interface ISaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

export interface ISale {
  _id: string;
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
  createdBy: string | IUser;
  createdAt: Date | string;
}
