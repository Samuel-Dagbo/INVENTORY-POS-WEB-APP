import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getUserFromRequest } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  SKU: z.string().min(1).optional(),
  barcode: z.string().optional().nullable(),
  category: z.string().min(1).optional(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    if (parsed.data.SKU) {
      const existing = await Product.findOne({
        SKU: parsed.data.SKU,
        _id: { $ne: params.id },
      });
      if (existing) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
      }
    }

    if (parsed.data.barcode) {
      const existing = await Product.findOne({
        barcode: parsed.data.barcode,
        _id: { $ne: params.id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Barcode already exists" },
          { status: 400 }
        );
      }
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
