import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { paymentSchema } from "@/schema/payment";
import db from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payouts = await db.payout.findMany({
      where: {
        userId,
      },
      include: {
        invoice: true,
      },
    });

    if (!payouts) {
      return NextResponse.json({ error: "No payouts found" }, { status: 404 });
    }

    return NextResponse.json(payouts, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await paymentSchema.partial().parseAsync(await req.json());

    const payout = await db.payout.findUnique({
      where: {
        id: payload.id,
        userId,
      },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    await db.payout.update({
      where: {
        id: payload.id,
        userId,
      },
      data: {
        ...payload,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
