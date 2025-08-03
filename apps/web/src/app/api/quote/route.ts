import { NextRequest, NextResponse } from "next/server";

type Config = {
  srcChainId: number;
  dstChainId: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: string;
  walletAddress: string;
};

export async function POST(req: NextRequest) {
  const {
    srcChainId,
    dstChainId,
    srcTokenAddress,
    dstTokenAddress,
    amount,
    walletAddress,
  } = (await req.json()) as Config;

  if (
    !srcChainId ||
    !dstChainId ||
    !srcTokenAddress ||
    !dstTokenAddress ||
    !amount ||
    !walletAddress
  ) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const url = "https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/receive";

    const params = new URLSearchParams({
      srcChain: srcChainId.toString(),
      dstChain: dstChainId.toString(),
      srcTokenAddress,
      dstTokenAddress,
      amount,
      walletAddress,
      enableEstimate: "true",
    });

    const fullUrl = `${url}?${params.toString()}`;

    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("1inch API error:", error);
    return NextResponse.json({ error: "Failed to get quote" }, { status: 500 });
  }
}
