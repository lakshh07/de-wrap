import { getAPIBaseUrl, getAPIHeaders } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const url = getAPIBaseUrl({
      method: "fusion-plus/relayer",
      version: "v1.0",
      path: `submit/secret`,
    });

    const response = await axios.post(url, body, {
      headers: getAPIHeaders({}),
    });

    const data = await response.data;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
