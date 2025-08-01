import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { invoiceSchema } from "@/schema/invoice";
import { z } from "zod";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await db.invoice.findMany({
      where: {
        user: { clerkId },
      },
    });

    if (!invoices) {
      return NextResponse.json({ error: "No invoices found" }, { status: 404 });
    }

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = await invoiceSchema.parseAsync(await req.json());

    await db.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...payload,
          status: "PENDING",
          userId: user.id,
        },
      });

      await tx.payout.create({
        data: {
          userId: user.id,
          invoiceId: invoice.id,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Invoice creation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
