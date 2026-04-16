import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getUserFromRequest } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(1),
  SKU: z.string().min(1),
  barcode: z.string().optional(),
  category: z.string().min(1),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  stockQuantity: z.number().min(0),
  lowStockThreshold: z.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.string().optional()),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (category && category !== "All") {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { SKU: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    const categories = await Product.distinct("category");

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const existingSku = await Product.findOne({ SKU: parsed.data.SKU });
    if (existingSku) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 400 }
      );
    }

    if (parsed.data.barcode) {
      const existingBarcode = await Product.findOne({ barcode: parsed.data.barcode });
      if (existingBarcode) {
        return NextResponse.json(
          { error: "Barcode already exists" },
          { status: 400 }
        );
      }
    }

    const product = await Product.create(parsed.data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
