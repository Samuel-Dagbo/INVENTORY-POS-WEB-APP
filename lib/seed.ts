import mongoose from "mongoose";
import { connectDB } from "./db";
import { User } from "./models/User";
import { Product } from "./models/Product";
import { Sale } from "./models/Sale";
import { hashPassword } from "./auth";

const seedProducts = [
  {
    name: "Organic Whole Milk",
    SKU: "MILK-001",
    barcode: "123456789001",
    category: "Dairy",
    costPrice: 2.5,
    sellingPrice: 4.99,
    stockQuantity: 50,
    lowStockThreshold: 10,
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
  },
  {
    name: "Free Range Eggs (12 pack)",
    SKU: "EGG-001",
    barcode: "123456789002",
    category: "Dairy",
    costPrice: 3.0,
    sellingPrice: 5.99,
    stockQuantity: 35,
    lowStockThreshold: 8,
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
  },
  {
    name: "Sourdough Bread",
    SKU: "BREAD-001",
    barcode: "123456789003",
    category: "Bakery",
    costPrice: 1.5,
    sellingPrice: 3.49,
    stockQuantity: 20,
    lowStockThreshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    name: "Premium Coffee Beans",
    SKU: "COFFEE-001",
    barcode: "123456789004",
    category: "Beverages",
    costPrice: 8.0,
    sellingPrice: 14.99,
    stockQuantity: 25,
    lowStockThreshold: 6,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
  },
  {
    name: "Extra Virgin Olive Oil",
    SKU: "OIL-001",
    barcode: "123456789005",
    category: "Condiments",
    costPrice: 5.0,
    sellingPrice: 9.99,
    stockQuantity: 15,
    lowStockThreshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
  },
  {
    name: "Chicken Breast",
    SKU: "MEAT-001",
    barcode: "123456789006",
    category: "Meat",
    costPrice: 4.0,
    sellingPrice: 7.99,
    stockQuantity: 8,
    lowStockThreshold: 10,
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
  },
  {
    name: "Atlantic Salmon Fillet",
    SKU: "FISH-001",
    barcode: "123456789007",
    category: "Seafood",
    costPrice: 6.0,
    sellingPrice: 11.99,
    stockQuantity: 12,
    lowStockThreshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400",
  },
  {
    name: "Fresh Spinach Bundle",
    SKU: "VEG-001",
    barcode: "123456789008",
    category: "Produce",
    costPrice: 1.0,
    sellingPrice: 2.49,
    stockQuantity: 30,
    lowStockThreshold: 10,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
  },
  {
    name: "Greek Yogurt",
    SKU: "YOGURT-001",
    barcode: "123456789009",
    category: "Dairy",
    costPrice: 1.5,
    sellingPrice: 3.29,
    stockQuantity: 40,
    lowStockThreshold: 10,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
  },
  {
    name: "Mixed Berry Jam",
    SKU: "JAM-001",
    barcode: "123456789010",
    category: "Condiments",
    costPrice: 2.0,
    sellingPrice: 4.49,
    stockQuantity: 22,
    lowStockThreshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
  },
];

export async function seedDatabase() {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const hashedPassword = await hashPassword("admin123");
      await User.create({
        email: "admin@example.com",
        password: hashedPassword,
        name: "System Admin",
        role: "admin",
      });
      console.log("Admin user created");
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(seedProducts);
      console.log("Products seeded");
    }

    const saleCount = await Sale.countDocuments();
    if (saleCount === 0) {
      const admin = await User.findOne({ email: "admin@example.com" });
      if (admin) {
        const products = await Product.find().limit(3);
        const items = products.map((p) => ({
          productId: p._id,
          name: p.name,
          SKU: p.SKU,
          quantity: 2,
          unitPrice: p.sellingPrice,
          costPrice: p.costPrice,
          subtotal: p.sellingPrice * 2,
        }));
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const profit = items.reduce(
          (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity,
          0
        );

        await Sale.create({
          invoiceNumber: "INV-00001",
          items,
          subtotal,
          tax: 0,
          total: subtotal,
          discount: 0,
          paymentMode: "cash",
          amountReceived: subtotal,
          change: 0,
          profit,
          createdBy: admin._id,
        });
        console.log("Sample sale created");
      }
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

seedDatabase();
