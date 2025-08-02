import db from "@/lib/prisma";
import { payoutSchema } from "@/schema/invoice";
import { MetricType } from "@prisma/client";
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
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { user: string; invoice: string } }
) {
  try {
    const { user: userId, invoice: invoiceId } = await params;

    if (!userId || !invoiceId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const body = await req.json();
    const payload = payoutSchema.parse(body);

    const data = await db.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: {
          id: invoiceId,
          userId,
        },
        data: {
          status: payload.invoiceStatus,
        },
      });

      await tx.payout.updateMany({
        where: {
          userId,
          invoiceId,
        },
        data: {
          status: payload.payoutStatus,
          amountPaid: payload.amountPaid,
          sourceToken: payload.sourceToken,
          amountPaidInCents: payload.amountPaidInCents,
          tokenPrice: payload.tokenPrice,
          sourceChain: payload.sourceChain,
          txHash: payload.txHash,
        },
      });

      if (payload.amountPaidInCents) {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { totalBalance: true },
        });

        const currentBalance = currentUser?.totalBalance || "0";
        const newBalance = (
          parseInt(currentBalance) + parseInt(payload.amountPaidInCents)
        ).toString();

        await tx.user.update({
          where: { id: userId },
          data: { totalBalance: newBalance },
        });

        await tx.userMetric.create({
          data: {
            userId,
            type: MetricType.BALANCE,
            value: payload.amountPaidInCents,
          },
        });
      }

      return updatedInvoice;
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
