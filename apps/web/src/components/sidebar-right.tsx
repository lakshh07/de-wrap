import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { getChainInfo } from "@/lib/utils";
import { useTokenPrice } from "@/hooks/use-tokens-price";
import { useTokenDetails } from "@/hooks/use-token-details";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/lib/axios";
import { useMemo } from "react";
import { Payout, Invoice } from "@prisma/client";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

type PayoutWithInvoice = Payout & {
  invoice: Invoice;
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: payouts } = useQuery({
    queryKey: ["payouts"],
    queryFn: async (): Promise<PayoutWithInvoice[]> => {
      const response = await Api.get<PayoutWithInvoice[]>("/payment");
      return response.data.filter((payout) => payout.status === "COMPLETED");
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const uniqueTokens = useMemo(() => {
    if (!payouts) return [];

    const tokenMap = new Map<
      string,
      {
        token: string;
        chain: number;
        amount: string;
        totalPaidUSD: number;
        averagePaidPrice: number;
      }
    >();

    payouts.forEach((payout) => {
      if (
        payout.sourceToken &&
        payout.sourceChain &&
        payout.amountPaid &&
        payout.tokenPrice
      ) {
        const key = `${payout.sourceToken}-${payout.sourceChain}`;
        const existing = tokenMap.get(key);
        const paidAmount = parseFloat(payout.amountPaid);
        const paidPrice = parseFloat(payout.tokenPrice);
        const paidUSD = paidAmount * paidPrice;

        if (existing) {
          // Sum up amounts and calculate weighted average price
          const currentAmount = parseFloat(existing.amount);
          const currentPaidUSD = existing.totalPaidUSD;
          const newTotalAmount = currentAmount + paidAmount;
          const newTotalPaidUSD = currentPaidUSD + paidUSD;
          const newAveragePrice = newTotalPaidUSD / newTotalAmount;

          tokenMap.set(key, {
            ...existing,
            amount: newTotalAmount.toString(),
            totalPaidUSD: newTotalPaidUSD,
            averagePaidPrice: newAveragePrice,
          });
        } else {
          tokenMap.set(key, {
            token: payout.sourceToken,
            chain: payout.sourceChain,
            amount: payout.amountPaid,
            totalPaidUSD: paidUSD,
            averagePaidPrice: paidPrice,
          });
        }
      }
    });

    return Array.from(tokenMap.values());
  }, [payouts]);

  const tokenAddresses = uniqueTokens.map((item) => item.token);
  const { data: tokenPrices } = useTokenPrice(tokenAddresses, 1);

  const { totalUSDBalance, totalProfit } = useMemo(() => {
    if (!tokenPrices) return { totalUSDBalance: 0, totalProfit: 0 };

    let totalBalance = 0;
    let totalProfit = 0;

    uniqueTokens.forEach((item) => {
      const currentPrice = tokenPrices[item.token];
      if (currentPrice) {
        const tokenBalance = parseFloat(item.amount);
        const currentPriceUSD = parseFloat(currentPrice);
        const currentValue = tokenBalance * currentPriceUSD;
        const paidValue = item.totalPaidUSD;
        const profit = currentValue - paidValue;

        totalBalance += currentValue;
        totalProfit += profit;
      }
    });

    return { totalUSDBalance: totalBalance, totalProfit };
  }, [tokenPrices, uniqueTokens]);

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-2 hidden h-svh lg:flex pb-2  w-[350px]"
      {...props}
    >
      <SidebarHeader className="pl-2 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Balances</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={"ghost"}
              size={"sm"}
              className="text-xs px-2.5 py-0 text-muted-foreground"
            >
              Auto-swap
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              className="text-xs px-2.5 py-0"
            >
              Withdraw
            </Button>
          </div>
        </div>
        {totalProfit ? (
          <div className="mt-1 flex items-center gap-2">
            <h3 className="text-sm font-medium">Profit:</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </SidebarHeader>
      <SidebarContent className="pl-2 pr-3.5">
        <div className="space-y-3">
          {uniqueTokens.map((item) => {
            const chainInfo = getChainInfo(item.chain);
            const tokenPrice = tokenPrices?.[item.token];
            const tokenBalanceUSD = tokenPrice
              ? parseFloat(item.amount) * parseFloat(tokenPrice)
              : 0;
            const tokenProfit = tokenPrice
              ? parseFloat(item.amount) * parseFloat(tokenPrice) -
                item.totalPaidUSD
              : 0;

            return (
              <TokenBalanceItem
                key={`${item.token}-${item.chain}`}
                tokenAddress={item.token}
                chainId={item.chain}
                amount={item.amount}
                tokenPrice={tokenPrice}
                tokenBalanceUSD={tokenBalanceUSD}
                tokenProfit={tokenProfit}
                averagePaidPrice={item.averagePaidPrice}
                chainInfo={chainInfo}
              />
            );
          })}
        </div>
      </SidebarContent>
      <SidebarFooter className="text-right px-3">
        <span className="text-xs text-muted-foreground">
          &copy; 2025 DeWrap. All rights reserved.
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}

function TokenBalanceItem({
  tokenAddress,
  chainId,
  amount,
  tokenPrice,
  tokenBalanceUSD,
  tokenProfit,
  averagePaidPrice,
  chainInfo,
}: {
  tokenAddress: string;
  chainId: number;
  amount: string;
  tokenPrice?: string;
  tokenBalanceUSD: number;
  tokenProfit: number;
  averagePaidPrice: number;
  chainInfo: { name: string; logoUrl: string };
}) {
  const { data: tokenDetails } = useTokenDetails(tokenAddress, chainId);

  if (!tokenDetails) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Avatar className="size-4">
              <AvatarImage
                src={tokenDetails.logoURI}
                alt={tokenDetails.symbol}
              />
              <AvatarFallback>{tokenDetails.symbol.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h4 className="text-sm font-medium truncate">
              {tokenDetails.name}
            </h4>
          </div>

          <Badge variant="outline" className="text-[10px]">
            {chainInfo.name}
          </Badge>
        </div>

        <div className="space-y-1">
          {/* Token Balance */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Balance</span>
            <span className="text-sm font-medium">
              {parseFloat(amount).toFixed(4)} {tokenDetails.symbol}
            </span>
          </div>

          {/* USD Value */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Value</span>
            <span className="text-sm text-muted-foreground">
              ${tokenBalanceUSD.toFixed(2)}
            </span>
          </div>

          {/* Token Price */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="text-xs text-muted-foreground">
              {tokenPrice
                ? `$${parseFloat(tokenPrice).toFixed(4)}`
                : "Loading..."}
            </span>
          </div>

          {/* Profit/Loss */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">P&L</span>
            <span
              className={`text-xs font-medium ${tokenProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {tokenProfit >= 0 ? "+" : ""}${tokenProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
