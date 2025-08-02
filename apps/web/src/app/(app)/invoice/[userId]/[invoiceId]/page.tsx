"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWriteContract, useAccount } from "wagmi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveABI, getBufferedSrcAmount, getChainInfo } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronDown,
  Loader2,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppKitNetwork } from "@reown/appkit/react";
import { modal as appKit } from "@/lib/appkit-config";
import { AppKitProviderConnector } from "@/lib/signers/AppKitProviderConnector";
import { formatUnits } from "viem";
import { Token } from "@/types/token";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { Invoice, InvoiceStatus, PayoutStatus } from "@prisma/client";
import { Api } from "@/lib/axios";
import { useTokenDetails } from "@/hooks/use-token-details";
import PaytmentPageLoading from "./_components/skeleton-loading";
import { Payout } from "@/schema/invoice";
import { dewrapContract } from "@/lib/dewrap-contracts";
import { useTokenPrice } from "@/hooks/use-tokens-price";

enum STEPS {
  SELECT_CHAIN = "SELECT_CHAIN",
  SELECT_TOKEN = "SELECT_TOKEN",
  APPROVE_TOKEN = "APPROVE_TOKEN",
  SEND_TRANSACTION = "SEND_TRANSACTION",
  SUCCESS = "SUCCESS",
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ userId: string; invoiceId: string }>;
}) {
  const { userId, invoiceId } = React.use(params);

  const { width, height } = useWindowSize();
  const [executingOrder, setExecutingOrder] = useState(false);
  const [connector, setConnector] = useState<AppKitProviderConnector | null>(
    null
  );
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<Partial<Token> | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.SELECT_CHAIN);

  const { caipNetwork, switchNetwork } = useAppKitNetwork();
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();

  const {
    writeContract,
    isPending: isWriteContractPending,
    isError: isWriteContractError,
    error: writeContractError,
    isSuccess: isWriteContractSuccess,
    data: txHash,
  } = useWriteContract();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", userId, invoiceId],
    queryFn: async () => {
      const res = await Api.get<Invoice>(`/invoice/${userId}/${invoiceId}`);
      return res.data;
    },
    enabled: !!userId && !!invoiceId,
  });

  const { data: token } = useTokenDetails(
    invoice?.preferredToken,
    Number(invoice?.preferredChain)
  );

  const { data: supportedChains } = useQuery({
    queryKey: ["supported-chains"],
    queryFn: async () => {
      const res = await Api.get<number[]>("/supported-network");
      return res.data;
    },
  });

  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ["tokens", selectedChainId],
    queryFn: async () => {
      const res = await Api.get<Token[]>(
        `/supported-network/${selectedChainId}/tokens`
      );
      return res.data;
      //   {
      //     chainId: 1,
      //     address: "0xc3d688b66703497daa19211eedff47f25384cdc3",
      //     name: "Compound USDC",
      //     decimals: 6,
      //     symbol: "cUSDCv3",
      //     logoURI:
      //       "https://tokens.1inch.io/0xc3d688b66703497daa19211eedff47f25384cdc3.png",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0xd01409314acb3b245cea9500ece3f6fd4d70ea30",
      //     name: "LTO Network Token",
      //     decimals: 8,
      //     symbol: "LTO",
      //     logoURI:
      //       "https://tokens.1inch.io/0xd01409314acb3b245cea9500ece3f6fd4d70ea30.png",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
      //     name: "BNB",
      //     decimals: 18,
      //     symbol: "BNB",
      //     logoURI:
      //       "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      //     tags: [],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0x320623b8e4ff03373931769a31fc52a4e78b5d70",
      //     name: "Reserve Rights",
      //     decimals: 18,
      //     symbol: "RSR",
      //     logoURI:
      //       "https://tokens.1inch.io/0x320623b8e4ff03373931769a31fc52a4e78b5d70.png",
      //     tags: ["tokens"],
      //     extensions: { eip2612: true },
      //   },
      //   {
      //     chainId: 1,
      //     address: "0x71ab77b7dbb4fa7e017bc15090b2163221420282",
      //     name: "Highstreet token",
      //     decimals: 18,
      //     symbol: "HIGH",
      //     logoURI:
      //       "https://tokens.1inch.io/0x71ab77b7dbb4fa7e017bc15090b2163221420282.png",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0x256d1fce1b1221e8398f65f9b36033ce50b2d497",
      //     name: "Alvey Chain",
      //     decimals: 18,
      //     symbol: "wALV",
      //     logoURI:
      //       "https://tokens.1inch.io/0x256d1fce1b1221e8398f65f9b36033ce50b2d497.png",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4",
      //     name: "NEAR",
      //     decimals: 24,
      //     symbol: "NEAR",
      //     logoURI:
      //       "https://tokens.1inch.io/0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4.png",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0xb23d80f5fefcddaa212212f028021b41ded428cf",
      //     name: "Prime",
      //     decimals: 18,
      //     symbol: "PRIME",
      //     logoURI:
      //       "https://assets.coingecko.com/coins/images/29053/large/PRIMELOGOOO.png?1676976222",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0x461b71cff4d4334bba09489ace4b5dc1a1813445",
      //     name: "Hoard",
      //     decimals: 9,
      //     symbol: "HRD",
      //     logoURI:
      //       "https://tokens.1inch.io/0x461b71cff4d4334bba09489ace4b5dc1a1813445.png",
      //     tags: ["tokens"],
      //   },
      //   {
      //     chainId: 1,
      //     address: "0x9e5bd9d9fad182ff0a93ba8085b664bcab00fa68",
      //     name: "Dinger Token",
      //     decimals: 9,
      //     symbol: "DINGER",
      //     logoURI:
      //       "https://tokens.1inch.io/0x9e5bd9d9fad182ff0a93ba8085b664bcab00fa68.png",
      //     tags: ["tokens"],
      //   },
      // ];
    },
    enabled: !!selectedChainId,
  });

  const { data: tokenPrice } = useTokenPrice(
    selectedToken?.address ? [selectedToken.address] : [],
    selectedChainId || undefined
  );

  const { mutate: updateInvoice } = useMutation({
    mutationFn: async (payload: Payout) => {
      const res = await Api.put(`/invoice/${userId}/${invoiceId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invoice", userId, invoiceId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["payouts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        }),
      ]);
      setExecutingOrder(false);
      // setCurrentStep(STEPS.SUCCESS);
    },
    onError: () => {
      setExecutingOrder(false);
      toast.error("Something went wrong");
    },
  });

  const requiredTokenAmount = useMemo(() => {
    if (!tokenPrice || !selectedToken?.address || !invoice?.amountInCents) {
      return "0.00";
    }

    const selectedTokenPrice = tokenPrice[selectedToken.address];
    if (!selectedTokenPrice) return "0.00";

    const usdAmount = parseFloat(invoice.amountInCents) * 1.04; // 4% network fee
    if (isNaN(usdAmount)) return "0.00";

    const tokenAmount = usdAmount / parseFloat(selectedTokenPrice);

    const decimals = selectedToken.decimals || 18;
    return tokenAmount.toFixed(decimals);
  }, [
    tokenPrice,
    selectedToken?.address,
    selectedToken?.decimals,
    invoice?.amountInCents,
  ]);

  const requiredTokenAmountUSD = useMemo(() => {
    if (!tokenPrice || !selectedToken?.address || !requiredTokenAmount) {
      return "0.00";
    }

    const selectedTokenPrice = tokenPrice[selectedToken.address];
    if (!selectedTokenPrice) return "0.00";

    const tokenAmount = parseFloat(requiredTokenAmount);
    if (isNaN(tokenAmount)) return "0.00";

    const usdValue = tokenAmount * parseFloat(selectedTokenPrice);
    return usdValue.toFixed(2);
  }, [tokenPrice, selectedToken?.address, requiredTokenAmount]);

  const bufferedAmount = useMemo(() => {
    if (!requiredTokenAmount || !selectedToken?.decimals) return 0;

    const tokenAmount = parseFloat(requiredTokenAmount);
    if (isNaN(tokenAmount)) return 0;

    const multiplier = Math.pow(10, selectedToken.decimals);
    const amountInSmallestUnit = BigInt(Math.floor(tokenAmount * multiplier));

    return getBufferedSrcAmount(amountInSmallestUnit);
  }, [requiredTokenAmount, selectedToken?.decimals]);

  const handleApprove = async () => {
    try {
      writeContract({
        address: selectedToken?.address as `0x${string}`,
        abi: approveABI,
        functionName: "approve",
        args: [
          dewrapContract.address[
            selectedChainId as keyof typeof dewrapContract.address
          ],
          Number(bufferedAmount),
        ],
      });
    } catch (err) {
      toast.error("Failed to approve token", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const handleSendTransaction = () => {
    if (!selectedToken?.address || !selectedChainId || !tokenPrice) return;
    setExecutingOrder(true);

    // writeContract({
    //   address: dewrapContract.address[
    //     selectedChainId as keyof typeof dewrapContract.address
    //   ] as `0x${string}`,
    //   abi: dewrapContract.abi,
    //   functionName: "pay",
    //   args: [invoice?.id, selectedToken?.address, Number(bufferedAmount)],
    // });

    setTimeout(() => {
      updateInvoice({
        amountPaid: requiredTokenAmount,
        amountPaidInCents: requiredTokenAmountUSD,
        sourceToken: selectedToken?.address ?? "",
        tokenPrice: tokenPrice?.[selectedToken?.address ?? ""] ?? "0",
        sourceChain: selectedChainId,
        invoiceStatus: "COMPLETED",
        payoutStatus: "COMPLETED",
        txHash: txHash ?? "",
      });
    }, 1000);
  };

  useEffect(() => {
    if (isWriteContractSuccess && currentStep === STEPS.APPROVE_TOKEN) {
      setCurrentStep(STEPS.SEND_TRANSACTION);
    }
  }, [isWriteContractSuccess, currentStep]);

  useEffect(() => {
    if (isConnected && appKit) {
      try {
        const newConnector = new AppKitProviderConnector(appKit as any);
        setConnector(newConnector);
      } catch (err) {
        console.error(`Failed to create connector: ${err}`);
      }
    } else {
      setConnector(null);
    }
  }, [isConnected]);

  useEffect(() => {
    if (caipNetwork) {
      setSelectedChainId(Number(caipNetwork.id));
    }
  }, [caipNetwork, currentStep]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isWriteContractError) {
      toast.error(
        writeContractError?.message?.includes("User denied")
          ? "Transaction was cancelled by user"
          : "Transaction failed. Please try again."
      );
    }
  }, [isWriteContractError, writeContractError]);

  const steps = [
    {
      id: STEPS.SELECT_CHAIN,
      title: "Select Chain",
      description: "Choose the network for your transaction",
      completed: currentStep !== STEPS.SELECT_CHAIN,
      current: currentStep === STEPS.SELECT_CHAIN,
    },
    {
      id: STEPS.SELECT_TOKEN,
      title: "Select Token",
      description: "Choose the token you want to use",
      completed:
        currentStep !== STEPS.SELECT_CHAIN &&
        currentStep !== STEPS.SELECT_TOKEN,
      current: currentStep === STEPS.SELECT_TOKEN,
    },
    {
      id: STEPS.APPROVE_TOKEN,
      title: "Approve Token",
      description: "Approve the token for the transaction",
      completed:
        currentStep !== STEPS.SELECT_CHAIN &&
        currentStep !== STEPS.SELECT_TOKEN &&
        currentStep !== STEPS.APPROVE_TOKEN,
      current: currentStep === STEPS.APPROVE_TOKEN,
    },
    {
      id: STEPS.SEND_TRANSACTION,
      title: "Send Transaction",
      description: "Execute the cross-chain transaction",
      completed: currentStep === STEPS.SUCCESS,
      current: currentStep === STEPS.SEND_TRANSACTION,
    },
  ];

  const handlePrevStep = () => {
    if (currentStep === STEPS.SELECT_TOKEN) {
      setCurrentStep(STEPS.SELECT_CHAIN);
    } else if (currentStep === STEPS.APPROVE_TOKEN) {
      setCurrentStep(STEPS.SELECT_TOKEN);
    } else if (currentStep === STEPS.SEND_TRANSACTION) {
      setCurrentStep(STEPS.APPROVE_TOKEN);
    }
  };

  const handleNextStep = () => {
    if (currentStep === STEPS.SELECT_CHAIN) {
      setCurrentStep(STEPS.SELECT_TOKEN);
    } else if (currentStep === STEPS.SELECT_TOKEN) {
      setCurrentStep(STEPS.APPROVE_TOKEN);
    } else if (currentStep === STEPS.APPROVE_TOKEN) {
      setCurrentStep(STEPS.SEND_TRANSACTION);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.SELECT_CHAIN:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Network</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose the network where you want to initiate the transaction
              from.
            </p>
            <Button onClick={() => handleSendTransaction()}>
              Send Transaction
            </Button>
            <Select
              value={selectedChainId?.toString()}
              onValueChange={(value) => {
                switchNetwork(getChainInfo(Number(value)).value);
                setSelectedChainId(Number(value));
                setCurrentStep(STEPS.SELECT_TOKEN);
                setSelectedToken(null);
              }}
            >
              <SelectTrigger className="cursor-pointer w-full">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent className="max-w-[280px]">
                {supportedChains
                  ?.filter(
                    (chainId) =>
                      !["501", "324", "8217", "1313161554", "8453"].includes(
                        chainId.toString()
                      )
                  )
                  .map((chainId) => (
                    <SelectItem
                      key={chainId}
                      value={chainId.toString()}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-5">
                          <AvatarImage
                            src={getChainInfo(chainId).logoUrl}
                            alt={getChainInfo(chainId).name}
                          />
                          <AvatarFallback>
                            {getChainInfo(chainId).name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getChainInfo(chainId).name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case STEPS.SELECT_TOKEN:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Token</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose the token you want to use for this transaction.
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={false}
                  className={cn(
                    "w-full justify-between bg-transparent text-zinc-500 font-normal cursor-pointer hover:bg-transparent hover:text-zinc-500",
                    selectedToken && "text-zinc-950 hover:text-zinc-950"
                  )}
                >
                  {selectedToken ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="size-5">
                        <AvatarImage
                          src={selectedToken.logoURI}
                          alt={selectedToken.symbol}
                        />
                        <AvatarFallback>
                          {selectedToken.symbol?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{selectedToken.name}</span>
                    </div>
                  ) : (
                    "Select Token"
                  )}
                  <ChevronDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search token..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No token found.</CommandEmpty>
                    <CommandGroup>
                      {tokens?.map((token) => (
                        <CommandItem
                          key={token.address}
                          value={`${token.name} ${token.symbol} ${token.address}`}
                          className="cursor-pointer"
                          onSelect={() => {
                            setSelectedToken(token);
                            setCurrentStep(STEPS.APPROVE_TOKEN);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-5">
                                <AvatarImage
                                  src={token.logoURI}
                                  alt={token.symbol}
                                />
                                <AvatarFallback>
                                  {token.symbol.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{token.name}</span>
                            </div>

                            <p className="text-xs text-gray-500">
                              {token.symbol}
                            </p>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto",
                              selectedToken?.address === token.address
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case STEPS.APPROVE_TOKEN:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Approve Token</h3>
            <p className="text-sm text-gray-600 mb-4">
              Approve the token for the cross-chain transaction. This allows the
              protocol to spend your tokens.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                You&apos;re about to approve{" "}
                <strong>
                  {parseFloat(requiredTokenAmount).toFixed(2)}{" "}
                  {selectedToken?.symbol}
                </strong>{" "}
                for the transaction.
                {requiredTokenAmountUSD && (
                  <span className="block mt-1">
                    (≈ ${requiredTokenAmountUSD} USD)
                  </span>
                )}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleApprove}
              disabled={
                isWriteContractPending ||
                !connector ||
                !selectedToken ||
                !selectedChainId
              }
            >
              {isWriteContractPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Approve {parseFloat(requiredTokenAmount).toFixed(2)}{" "}
              {selectedToken?.symbol}
            </Button>
          </div>
        );

      case STEPS.SEND_TRANSACTION:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Send Transaction</h3>
            <p className="text-sm text-gray-600 mb-4">
              Execute the cross-chain transaction to complete your payment.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                Token approved! Ready to execute the transaction for{" "}
                <strong>
                  {parseFloat(requiredTokenAmount).toFixed(2)}{" "}
                  {selectedToken?.symbol}
                </strong>
                .
                {requiredTokenAmountUSD && (
                  <span className="block mt-1">
                    (≈ ${requiredTokenAmountUSD} USD)
                  </span>
                )}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleSendTransaction}
              disabled={isWriteContractPending || executingOrder}
            >
              {isWriteContractPending || executingOrder ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Send {parseFloat(requiredTokenAmount).toFixed(2)}{" "}
              {selectedToken?.symbol}
            </Button>
          </div>
        );

      case STEPS.SUCCESS:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600">Success!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your transaction has been completed successfully.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm  text-green-800">
                Payment processed successfully.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="h-screen w-full bg-zinc-100 bg-[url('/assets/images/grid-bg.png')] bg-center bg-repeat overflow-hidden relative">
      <div className="grad3" />
      <div className="grad4" />

      <nav className="py-2.5 mx-[5%] text-zinc-950 rounded-xl mt-4 pl-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-cairo">DeWrap</h1>

        <div className="scale-90 flex items-center gap-2">
          {mounted && (
            <>
              <appkit-network-button />
              <appkit-button />
            </>
          )}
        </div>
      </nav>

      {isLoading || tokensLoading ? (
        <PaytmentPageLoading />
      ) : (
        <div className="flex-grow top-14 relative flex items-center justify-center p-4">
          <div className="w-full mx-[3%] shadow-xl rounded-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            <div className="bg-white p-8">
              <h2 className="text-2xl font-semibold mb-4">Invoice</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Billed To:</p>
                <p className="text-base font-medium">{invoice?.name}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Invoice Id:</p>
                <p className="text-base font-medium">#INV-{invoice?.id}</p>
              </div>

              <div className="bg-white border border-yellow-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  This invoice is prefers payment in{" "}
                  <span className="font-semibold">{token?.symbol}</span> on the{" "}
                  <span className="font-semibold">
                    {invoice?.preferredChain
                      ? getChainInfo(invoice?.preferredChain).name
                      : "any"}
                  </span>{" "}
                  for faster processing. However, you&apos;re free to pay using
                  any token on any supported chain — just ensure the equivalent
                  value is transferred and provide the correct transaction
                  details.
                </p>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Invoice Amount</span>
                  <span className="text-sm font-medium">
                    {parseFloat(
                      formatUnits(
                        BigInt(Number(invoice?.amount ?? 0)),
                        token?.decimals ?? 18
                      )
                    ).toFixed(2)}{" "}
                    {token?.symbol}
                    <span className="text-xs pl-1 font-medium text-muted-foreground">
                      (≈
                      {parseFloat(invoice?.amountInCents ?? "0").toFixed(2)}
                      USD)
                    </span>
                  </span>
                </div>
                {selectedToken && requiredTokenAmount && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Required {selectedToken.symbol} (Equivalent)
                      </span>
                      <span className="text-sm font-medium">
                        {parseFloat(
                          (Number(requiredTokenAmount) * 0.96).toFixed(2)
                        )}{" "}
                        {selectedToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Network Fee (estimated)
                      </span>
                      <span className="text-sm font-medium">~0.4%</span>
                    </div>
                    <div className="flex justify-between mt-4 border-t pt-4">
                      <span className="text-lg font-semibold">Amount Due</span>
                      <span className="text-lg font-bold text-green-600">
                        {parseFloat(requiredTokenAmount).toFixed(2)}{" "}
                        {selectedToken.symbol}
                      </span>
                    </div>
                  </>
                )}
                {!selectedToken && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Network Fee (estimated)
                      </span>
                      <span className="text-sm font-medium">~0.4%</span>
                    </div>
                    <div className="flex justify-between mt-4 border-t pt-4">
                      <span className="text-lg font-semibold">Amount Due</span>
                      <span className="text-lg font-bold text-green-600">
                        {parseFloat(
                          formatUnits(
                            getBufferedSrcAmount(
                              BigInt(Number(invoice?.amount ?? 0))
                            ),
                            token?.decimals ?? 18
                          )
                        ).toFixed(2)}{" "}
                        {token?.symbol}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-8 bg-[#ffffff33] backdrop-blur-md flex flex-col justify-center">
              {currentStep !== STEPS.SUCCESS &&
                invoice?.status !== "COMPLETED" && (
                  <div className="max-w-2xl mx-auto flex flex-col gap-4 justify-center items-center w-full">
                    {/* Step Indicator */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between">
                        {steps.map(
                          (step: (typeof steps)[number], index: number) => {
                            const currentStepIndex = steps.findIndex(
                              (s) => s.id === currentStep
                            );
                            const isFutureStep = index > currentStepIndex;
                            return (
                              <React.Fragment key={step.id}>
                                <div
                                  className={cn(
                                    "flex flex-col items-center mx-2",
                                    isFutureStep &&
                                      "pointer-events-none opacity-50",
                                    !isFutureStep && "cursor-pointer"
                                  )}
                                  onClick={() => {
                                    if (!isFutureStep) setCurrentStep(step.id);
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                                      step.completed
                                        ? "bg-green-500 border-green-500 text-white"
                                        : step.current
                                          ? "bg-blue-500 border-blue-500 text-white"
                                          : "bg-gray-100 border-gray-300 text-gray-400"
                                    )}
                                  >
                                    {step.completed ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : step.current ? (
                                      <span className="text-sm font-medium">
                                        {index + 1}
                                      </span>
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="mt-2 text-center">
                                    <p className="text-xs font-medium text-gray-900">
                                      {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {step.description}
                                    </p>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="bg-white rounded-lg p-6 shadow-sm w-full">
                      {renderStepContent()}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant={"ghost"}
                        onClick={handlePrevStep}
                        disabled={currentStep === STEPS.SELECT_CHAIN}
                      >
                        <ChevronLeft />
                      </Button>

                      <Button
                        variant={"ghost"}
                        onClick={handleNextStep}
                        disabled={
                          (currentStep === STEPS.SELECT_CHAIN &&
                            !selectedChainId) ||
                          (currentStep === STEPS.SELECT_TOKEN &&
                            !selectedToken) ||
                          (currentStep === STEPS.APPROVE_TOKEN &&
                            !selectedToken) ||
                          (currentStep === STEPS.SEND_TRANSACTION &&
                            !selectedToken)
                        }
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                )}

              {currentStep === STEPS.SUCCESS ||
                (invoice?.status === "COMPLETED" && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-600">
                        Success!
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your transaction has been completed successfully.
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm  text-green-800">
                        Payment processed successfully. You will receive a
                        confirmation shortly.
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === STEPS.SUCCESS && (
        <Confetti width={width} height={height} recycle={false} />
      )}
    </main>
  );
}
