import { getAPIBaseUrl, getAPIHeaders } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const payload = await z
      .object({
        network: z.string(),
        token: z.string().transform((val) => val.split(",")),
      })
      .parseAsync(Object.fromEntries(request.nextUrl.searchParams));

    const url = getAPIBaseUrl({
      method: "price",
      version: "v1.1",
      path: `${payload.network}`,
    });

    const response = await axios.post(
      url,
      { tokens: payload.token, currency: "USD" },
      {
        headers: getAPIHeaders({}),
      }
    );

    const data = await response.data;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
