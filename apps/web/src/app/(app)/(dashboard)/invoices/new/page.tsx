"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getChainInfo } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import axios from "axios";
import { Token } from "@/types/token";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import { parseUnits } from "viem";
import { useRouter } from "nextjs-toploader/app";

const NewInvoice = () => {
  const [invoice, setInvoice] = useState<{
    payerName: string;
    amount: string;
    preferredToken: string;
    preferredChain: number;
    details: string;
  }>({
    payerName: "",
    amount: "",
    preferredToken: "",
    preferredChain: 0,
    details: "",
  });
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: supportedChains } = useQuery({
    queryKey: ["supported-chains"],
    queryFn: async () => {
      const res = await axios.get<number[]>("/api/supported-network");
      return res.data;
    },
  });

  const { data: tokens } = useQuery({
    queryKey: ["tokens", selectedChainId],
    queryFn: async () => {
      const res = await axios.get<Token[]>(
        `/api/supported-network/${selectedChainId}/tokens`
      );
      return res.data;
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

  const { mutate: mutateInvoice, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/invoice", {
        name: invoice.payerName,
        preferredChain: invoice.preferredChain,
        preferredToken: invoice.preferredToken,
        amount: Number(
          parseUnits(invoice.amount, selectedToken?.decimals || 18)
        ).toString(),
        details: invoice.details,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice completed successfully");
      router.push("/payments/invoices");
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to complete invoice");
    },
  });

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Create New Invoice</h1>
          <p className="text-muted-foreground">
            Generate a new invoice link for payment
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payer-name">Payer Name</Label>
                <Input
                  id="payer-name"
                  disabled={isPending}
                  placeholder="Enter payer name"
                  value={invoice.payerName}
                  onChange={(e) =>
                    setInvoice({ ...invoice, payerName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred-chain">Preferred Chain</Label>
                <Select
                  disabled={isPending}
                  value={selectedChainId?.toString()}
                  onValueChange={(value) => {
                    setSelectedChainId(Number(value));
                    setInvoice({ ...invoice, preferredChain: Number(value) });
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
                          ![
                            "501",
                            "324",
                            "8217",
                            "1313161554",
                            "8453",
                          ].includes(chainId.toString())
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
              <div className="space-y-2">
                <Label htmlFor="preferred-token">Preferred Token</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={!selectedChainId || isPending}
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
                          <span className="font-medium">
                            {selectedToken.name}
                          </span>
                        </div>
                      ) : (
                        "Select Token"
                      )}
                      <ChevronDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search token..."
                        className="h-9"
                      />
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
                                setInvoice({
                                  ...invoice,
                                  preferredToken: token.address,
                                });
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
                                  <span className="font-medium">
                                    {token.name}
                                  </span>
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
              <div className="space-y-2">
                <Label htmlFor={`amount`}>Amount</Label>
                <Input
                  id={`amount`}
                  disabled={isPending}
                  type="number"
                  placeholder="0.00"
                  value={invoice.amount}
                  onChange={(e) =>
                    setInvoice({ ...invoice, amount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`details`}>Description</Label>
              <Textarea
                id={`details`}
                rows={5}
                disabled={isPending}
                placeholder="Enter description (you can use markdown)"
                value={invoice.details}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInvoice({ ...invoice, details: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="w-32"
            disabled={isPending}
            onClick={() => mutateInvoice()}
          >
            {isPending ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
