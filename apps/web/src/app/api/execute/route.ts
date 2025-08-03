import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "ethers";
import { HashLock } from "@1inch/cross-chain-sdk";
import axios from "axios";

function getRandomBytes32(): string {
  return "0x" + Buffer.from(randomBytes(32)).toString("hex");
}

const quote = "https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/receive";
const quoteBuild = "https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/build";

export async function POST(req: NextRequest) {
  try {
    const config = await req.json();

    console.log("Config", config);

    const quoteParams = new URLSearchParams({
      ...config,
      enableEstimate: "true",
    });

    console.log("Quote params", quoteParams);

    const quoteUrl = `${quote}?${quoteParams.toString()}`;

    console.log("Getting quote");

    const quoteResponse = await fetch(quoteUrl, {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    });

    const quoteData = await quoteResponse.json();

    if (quoteData.error) {
      return NextResponse.json(
        { error: "Failed to get quote", details: quoteData.error },
        { status: 500 }
      );
    }

    console.log("Quote received");

    const quoteBuildParams = new URLSearchParams(config);

    const quoteBuildUrl = `${quoteBuild}?${quoteBuildParams.toString()}`;

    console.log("Building quote");

    const secretsCount =
      quoteData.presets.fast.secretsCount ||
      quoteData.presets.medium.secretsCount ||
      quoteData.presets.slow.secretsCount;

    console.log("Building quote - secrets count", secretsCount);

    const secrets = Array.from({ length: secretsCount }).map(() =>
      getRandomBytes32()
    );
    const secretHashes = secrets.map((x) => HashLock.hashSecret(x));

    console.log("Building quote - secret hashes created");

    const quoteBuildBody = {
      quote: quoteData,
      secretsHashList: secretHashes,
    };

    const quoteBuildResponse = await axios.post(quoteBuildUrl, quoteBuildBody, {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const quoteBuildData = quoteBuildResponse.data;

    if (quoteBuildData.error) {
      return NextResponse.json(
        { error: "Failed to build quote", details: quoteBuildData.error },
        { status: 500 }
      );
    }

    console.log("Quote build received");

    return NextResponse.json(
      { ...quoteBuildData, quoteId: quoteData.quoteId, secretHashes },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to execute order", details: error },
      { status: 500 }
    );
  }
}
