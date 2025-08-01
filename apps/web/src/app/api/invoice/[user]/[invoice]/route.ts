import db from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { user: string; invoice: string } }
) {
  try {
    const { user: userId, invoice: invoiceId } = await params;

    const invoice = await db.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: userId,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
