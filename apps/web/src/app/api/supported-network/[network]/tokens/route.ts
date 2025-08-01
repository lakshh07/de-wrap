import { getAPIBaseUrl, getAPIHeaders } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ network: number }> }
) {
  const { network } = await params;

  const url = getAPIBaseUrl({
    method: "token",
    version: "v1.3",
    path: `${network}/token-list`,
  });

  const response = await fetch(url, {
    headers: getAPIHeaders({}),
  });

  const data = await response.json();

  return NextResponse.json(data.tokens, { status: 200 });
}
