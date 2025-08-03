import { getAPIBaseUrl, getAPIHeaders } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const payload = await z
      .object({
        address: z.string(),
      })
      .parseAsync(Object.fromEntries(request.nextUrl.searchParams));

    const url = getAPIBaseUrl({
      method: "fusion-plus/orders",
      version: "v1.0",
      path: `order/maker/${payload.address}`,
    });

    const response = await axios.get(url, {
      headers: getAPIHeaders({}),
    });

    const data = await response.data;

    return NextResponse.json(data.items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
