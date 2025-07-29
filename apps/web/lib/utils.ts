import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  mainnet,
  polygon,
  bsc,
  base,
  arbitrum,
  optimism,
  avalanche,
  fantom,
  gnosis,
  linea,
} from "@reown/appkit/networks";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAPIBaseUrl({
  extraUrl,
  method,
  version,
  path,
}: {
  extraUrl?: string;
  method: string;
  version: string;
  path: string;
}) {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${extraUrl ? `/${extraUrl}` : ""}/${method}/${version}/${path}`;
}

export function getAPIHeaders({
  headers,
}: {
  headers?: Record<string, string>;
}) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
    ...headers,
  };
}

export function getChainInfo(chainId: number | string) {
  const chains: Record<number, { name: string; logoUrl: string; value: any }> =
    {
      1: {
        name: "Ethereum",
        logoUrl: "/assets/logos/ethereum-eth-logo.svg",
        value: mainnet,
      },
      56: {
        name: "Binance Smart Chain",
        logoUrl: "/assets/logos/binance-usd-busd-logo.svg",
        value: bsc,
      },
      137: {
        name: "Polygon",
        logoUrl: "/assets/logos/polygon-matic-logo.svg",
        value: polygon,
      },
      10: {
        name: "Optimism",
        logoUrl: "/assets/logos/optimism-ethereum-op-logo.svg",
        value: optimism,
      },
      42161: {
        name: "Arbitrum",
        logoUrl: "/assets/logos/arbitrum-arb-logo.svg",
        value: arbitrum,
      },
      43114: {
        name: "Avalanche",
        logoUrl: "/assets/logos/avalanche-avax-logo.svg",
        value: avalanche,
      },
      250: {
        name: "Fantom",
        logoUrl: "/assets/logos/fantom-ftm-logo.svg",
        value: fantom,
      },
      100: {
        name: "Gnosis Chain",
        logoUrl: "/assets/logos/gnosis-gno-gno-logo.svg",
        value: gnosis,
      },
      59144: {
        name: "Linea",
        logoUrl: "/assets/logos/linea-logo.svg",
        value: linea,
      },
    };

  const id = Number(chainId);
  const entry = chains[id];

  if (!entry) {
    return {
      name: "Unknown Chain",
      logoUrl: "",
    };
  }

  return {
    name: entry.name,
    logoUrl: entry.logoUrl,
    value: entry.value,
  };
}

export const approveABI = [
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

export function getBufferedSrcAmount(
  desiredDstAmount: bigint,
  bufferPercent: number = 0.4
) {
  const multiplier = BigInt(Math.ceil(1000 + bufferPercent * 10)); // e.g. 1004 for 0.4%
  const bufferedAmount = (desiredDstAmount * multiplier) / BigInt(1000);

  return bufferedAmount;
}
