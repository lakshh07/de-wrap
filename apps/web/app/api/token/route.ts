import { getAPIBaseUrl, getAPIHeaders } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const payload = await z
    .object({
      network: z.string(),
      token: z.string(),
    })
    .parseAsync(Object.fromEntries(request.nextUrl.searchParams));

  const url = getAPIBaseUrl({
    method: "token",
    version: "v1.3",
    path: `${payload.network}/custom/${payload.token}`,
  });

  const response = await fetch(url, {
    headers: getAPIHeaders({}),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: 200 });
}
