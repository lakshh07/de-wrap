"use client";

import React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  IconClock,
  IconLoader,
  IconCheck,
  IconX,
  IconBan,
} from "@tabler/icons-react";
import { Invoice, Payout, PayoutStatus } from "@prisma/client";
import { TableCellViewer } from "./data-table";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { formatId, getChainInfo } from "@/lib/utils";
import { useTokenDetails } from "@/hooks/use-token-details";
import { formatUnits, parseUnits } from "viem";

function TokenCell({ row }: { row: Row<Payout & { invoice: Invoice }> }) {
  const { data: tokenDetails } = useTokenDetails(
    row.original.invoice.preferredToken,
    row.original.invoice.preferredChain
  );

  if (!tokenDetails) {
    return <div className="text-sm text-right text-muted-foreground">N/A</div>;
  }

  if (row.original.invoice.amount && tokenDetails) {
    return (
      <div className="text-right">
        <div className="text-right text-sm space-x-1">
          {formatUnits(
            BigInt(row.original.invoice.amount),
            tokenDetails.decimals ?? 18
          )}{" "}
          {tokenDetails.symbol}
        </div>
        <span className="text-xs text-muted-foreground">
          ~{row.original.invoice.amountInCents} USD
        </span>
      </div>
    );
  }
}

function PaidCell({ row }: { row: Row<Payout & { invoice: Invoice }> }) {
  const { data: tokenDetails } = useTokenDetails(
    row.original.sourceToken || "",
    row.original.sourceChain || 0
  );

  if (!tokenDetails) {
    return <div className="text-xs text-right text-muted-foreground">N/A</div>;
  }

  return (
    <div className="text-right">
      <div className="text-right text-sm space-x-1">
        {Number(row.original.amountPaid).toFixed(2)} {tokenDetails.symbol}
      </div>
      {row.original.amountPaidInCents && (
        <span className="text-xs text-muted-foreground">
          ~{row.original.amountPaidInCents} USD
        </span>
      )}
    </div>
  );
}

function getStatusDisplay(status: PayoutStatus | undefined) {
  if (status === undefined) {
    return {
      icon: <IconClock className="size-3" />,
      variant: "secondary" as const,
      label: "Unknown",
    };
  }

  switch (status) {
    case PayoutStatus.PENDING:
      return {
        icon: <IconClock className="size-3 text-yellow-500" />,
        variant: "secondary" as const,
        label: "Pending",
      };
    case PayoutStatus.ONGOING:
      return {
        icon: <IconLoader className="size-3 animate-spin" />,
        variant: "secondary" as const,
        label: "Ongoing",
      };
    case PayoutStatus.COMPLETED:
      return {
        icon: <IconCheck className="size-3 text-green-500" />,
        variant: "default" as const,
        label: "Completed",
      };
    case PayoutStatus.FAILED:
      return {
        icon: <IconX className="size-3 text-red-500" />,
        variant: "destructive" as const,
        label: "Failed",
      };
    case PayoutStatus.CANCELLED:
      return {
        icon: <IconBan className="size-3 text-red-500" />,
        variant: "outline" as const,
        label: "Cancelled",
      };
    default:
      return {
        icon: <IconClock className="size-3 text-yellow-500" />,
        variant: "secondary" as const,
        label: "Unknown",
      };
  }
}

function PayoutDetailView({ item }: { item: Payout & { invoice: Invoice } }) {
  const statusDisplay = getStatusDisplay(item.status);

  return (
    <>
      <DrawerHeader className="gap-1">
        <DrawerTitle className="flex items-center justify-between">
          <div className="flex items-center text-lg">
            <span className="font-medium">Payout Details - </span>
            <span className="text-muted-foreground text-base">
              {format(new Date(item.createdAt), "MMM dd, yyyy")}
            </span>
          </div>
          <Badge variant={"outline"} className="text-zinc-600">
            {statusDisplay.icon}
            {statusDisplay.label}
          </Badge>
        </DrawerTitle>

        <DrawerDescription className="text-xs text-zinc-400">
          {item.id}
        </DrawerDescription>
      </DrawerHeader>
      <Separator />
      <div className="flex flex-col gap-4 mt-4 overflow-y-auto px-4 text-sm">
        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="payer">Payer</Label>
              <Input id="payer" defaultValue={item.invoice.name} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="targetChain">Target Chain</Label>
              {/* <Input
                  id="targetChain"
                  defaultValue={item.targetChain?.toString()}
                  readOnly
              /> */}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="sourceChain">Source Chain</Label>
              <Input
                id="sourceChain"
                defaultValue={item.sourceChain?.toString()}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="invoiceAmount">Invoice Amount</Label>
              {/* <Input
                id="invoiceAmount"
                defaultValue={formatAmount(
                  item.invoiceAmount,
                  item.sourceToken
                )}
                readOnly
              /> */}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="amountPaid">Amount Paid</Label>
              {/* <Input
                id="amountPaid"
                defaultValue={formatAmount(item.amountPaid, item.targetToken)}
                readOnly
              /> */}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue={item.status.toString()}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PayoutStatus.PENDING.toString()}>
                  Pending
                </SelectItem>
                <SelectItem value={PayoutStatus.ONGOING.toString()}>
                  Ongoing
                </SelectItem>
                <SelectItem value={PayoutStatus.COMPLETED.toString()}>
                  Completed
                </SelectItem>
                <SelectItem value={PayoutStatus.FAILED.toString()}>
                  Failed
                </SelectItem>
                <SelectItem value={PayoutStatus.CANCELLED.toString()}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="txHash">Transaction Hash</Label>
            <Input id="txHash" defaultValue={item.txHash || ""} />
          </div>
        </form>
      </div>
      <DrawerFooter>
        <Button>Update Payout</Button>
        <DrawerClose asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

// Payout columns definition
export const payoutColumns: ColumnDef<Payout & { invoice: Invoice }>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Payout ID",
    cell: ({ row }) => {
      return (
        <TableCellViewer
          item={row.original}
          detailView={PayoutDetailView}
          formatter={formatId}
        />
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "payer",
    header: "Payer",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          {row.original.invoice.name || "Unknown"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusDisplay = getStatusDisplay(row.original.status);
      return (
        <Badge variant={"outline"} className="px-1.5">
          {statusDisplay.icon}
          {statusDisplay.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.direction || "Inbound"}
      </span>
    ),
  },
  {
    accessorKey: "preferredChain",
    header: "Preferred Chain",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {getChainInfo(row.original.invoice.preferredChain).name}
      </div>
    ),
  },
  {
    accessorKey: "sourceChain",
    header: "Source Chain",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.sourceChain ? (
          getChainInfo(row.original.sourceChain).name
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "invoiceAmount",
    header: () => <div className="text-right">Invoice Amount</div>,
    cell: ({ row }) => <TokenCell row={row} />,
  },
  {
    accessorKey: "amountPaid",
    header: () => <div className="text-right">Amount Paid</div>,
    cell: ({ row }) => {
      return <PaidCell row={row} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">Created</div>,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground text-center">
        {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
      </div>
    ),
  },
];
