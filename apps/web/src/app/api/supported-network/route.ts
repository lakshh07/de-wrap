import { NextResponse } from "next/server";
import { getAPIBaseUrl, getAPIHeaders } from "@/lib/utils";

export async function GET() {
  try {
    const url = getAPIBaseUrl({
      method: "token",
      version: "v1.3",
      path: "multi-chain/supported-chains",
    });

    const response = await fetch(url, {
      headers: getAPIHeaders({}),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
