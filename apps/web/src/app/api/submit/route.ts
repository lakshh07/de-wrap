import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  //   try {
  const body = await req.json();

  console.log("body", body);

  console.log("submitting order");

  const submitOrderResponse = await axios.post(
    "https://api.1inch.dev/fusion-plus/relayer/v1.0/submit",
    body,
    {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.error("submitOrderResponse", submitOrderResponse);

  const submitOrderData = submitOrderResponse.data;

  console.error("submitOrderData", submitOrderData);

  if (submitOrderData.error) {
    return NextResponse.json(
      { error: "Failed to build quotee", details: submitOrderData.error },
      { status: 500 }
    );
  }

  return NextResponse.json(submitOrderData, { status: 200 });
  //   } catch (error) {
  //     return NextResponse.json(
  //       { error: "Failed to execute order", details: error },
  //       { status: 500 }
  //     );
  //   }
}
