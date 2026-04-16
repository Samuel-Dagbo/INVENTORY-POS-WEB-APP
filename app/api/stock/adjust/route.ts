import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getUserFromRequest } from "@/lib/auth";

const adjustSchema = z.object({
  productId: z.string(),
  adjustment: z.number(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = adjustSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findByIdAndUpdate(
      parsed.data.productId,
      { $inc: { stockQuantity: parsed.data.adjustment } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stockQuantity < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Stock adjust error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
