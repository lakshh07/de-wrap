import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { invoiceSchema } from "@/schema/incoice";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await db.invoice.findMany({
      where: {
        userId,
      },
    });

    if (!invoices) {
      return NextResponse.json({ error: "No invoices found" }, { status: 404 });
    }

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await invoiceSchema.parseAsync(await req.json());

    await db.$transaction(async (tx: PrismaClient) => {
      const invoice = await tx.invoice.create({
        data: {
          ...payload,
          status: "PENDING",
          userId,
        },
      });

      await tx.payout.create({
        data: {
          userId,
          invoiceId: invoice.id,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
