import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";
import { getUserFromRequest } from "@/lib/auth";
import { nanoid } from "nanoid";

const saleItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  SKU: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0),
  subtotal: z.number().min(0),
});

const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  subtotal: z.number().min(0),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
  paymentMode: z.enum(["cash", "card", "mobile_money", "other"]),
  amountReceived: z.number().min(0),
  change: z.number().min(0),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) (query.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
      if (dateTo) (query.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("createdBy", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Sale.countDocuments(query),
    ]);

    return NextResponse.json({
      sales,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Sales fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = saleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const session = await Product.startSession();
    session.startTransaction();

    try {
      for (const item of parsed.data.items) {
        const product = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, session }
        );

        if (!product) {
          throw new Error(`Product ${item.name} not found`);
        }

        if (product.stockQuantity < 0) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
      }

      const profit = parsed.data.items.reduce(
        (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity,
        0
      );

      const invoiceNumber = `INV-${nanoid(8).toUpperCase()}`;

      const sale = await Sale.create(
        [
          {
            ...parsed.data,
            invoiceNumber,
            profit,
            createdBy: user._id,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json(sale[0], { status: 201 });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Sale create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
