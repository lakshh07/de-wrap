import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { MetricType } from "@prisma/client";
import { subDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filters = z
      .object({
        type: z
          .string()
          .transform((value) =>
            value ? (value.split(",") as MetricType[]) : undefined
          ),
        start: z.string(),
      })
      .parse(Object.fromEntries(req.nextUrl.searchParams));

    const start = subDays(now, Number(filters.start));

    const metrics = await db.userMetric.findMany({
      where: {
        user: { clerkId },
        type: { in: filters.type },
        timestamp: { gte: start },
      },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
