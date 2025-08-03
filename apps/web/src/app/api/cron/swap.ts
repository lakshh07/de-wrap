import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { Invoice, Payout, User } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const usersWithAutoSwap = await db.user.findMany({
      where: {
        autoSwap: true,
      },
      include: {
        payouts: {
          include: {
            invoice: true,
          },
          where: {
            status: "COMPLETED",
          },
        },
      },
    });

    if (!usersWithAutoSwap || usersWithAutoSwap.length === 0) {
      return NextResponse.json(
        { message: "No users found with autoSwap enabled" },
        { status: 200 }
      );
    }

    const results = [];

    for (const user of usersWithAutoSwap) {
      for (const payout of user.payouts) {
        const invoice = payout.invoice;

        const isMatch =
          payout.sourceChain === invoice.preferredChain &&
          payout.sourceToken === invoice.preferredToken;

        if (isMatch) {
          results.push({
            userId: user.id,
            payoutId: payout.id,
            invoiceId: invoice.id,
            status: "MATCHED",
            message: "Payout source matches invoice preferences",
            payout,
            invoice,
          });
        } else {
          await runSwapFunction(payout, invoice, user);

          results.push({
            userId: user.id,
            payoutId: payout.id,
            invoiceId: invoice.id,
            status: "SWAP_REQUIRED",
            message:
              "Payout source doesn't match invoice preferences - swap function executed",
            payout,
            invoice,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        results,
        totalProcessed: results.length,
        usersProcessed: usersWithAutoSwap.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Swap cron job error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Placeholder function for swap logic
async function runSwapFunction(payout: Payout, invoice: Invoice, user: User) {
  console.log(
    `Swap function called for payout ${payout.id} and invoice ${invoice.id}`
  );
  console.log(`Payout: ${payout.sourceToken} on chain ${payout.sourceChain}`);
  console.log(
    `Invoice prefers: ${invoice.preferredToken} on chain ${invoice.preferredChain}`
  );

  // Placeholder implementation - replace with actual swap logic
  // Example: Call external swap service, update payout status, etc.
}
