"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  IconClock,
  IconCheck,
  IconX,
  IconBan,
  IconCopy,
  IconExternalLink,
} from "@tabler/icons-react";
import { Invoice, InvoiceStatus } from "@prisma/client";
import { TableCellViewer } from "./data-table";
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Separator } from "./ui/separator";
import { formatId, getChainInfo } from "@/lib/utils";
import { format } from "date-fns";
import { formatUnits } from "viem";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import Link from "next/link";
import { useTokenDetails } from "@/hooks/use-token-details";

function TokenCell({
  token,
  chain,
  amount,
}: {
  token: string;
  chain: number;
  amount?: number;
}) {
  const { data: tokenDetails } = useTokenDetails(token, chain);

  if (tokenDetails && amount) {
    return (
      <div className="text-right text-sm">
        {formatUnits(BigInt(amount || 0), tokenDetails?.decimals || 18)}
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      {tokenDetails && tokenDetails?.symbol}
    </div>
  );
}

function getStatusDisplay(status: InvoiceStatus | undefined) {
  if (status === undefined) {
    return {
      icon: <IconClock className="size-3" />,
      variant: "secondary" as const,
      label: "Unknown",
    };
  }

  switch (status) {
    case InvoiceStatus.PENDING:
      return {
        icon: <IconClock className="size-3 text-yellow-500" />,
        variant: "secondary" as const,
        label: "Pending",
      };
    case InvoiceStatus.COMPLETED:
      return {
        icon: <IconCheck className="size-3 text-green-500" />,
        variant: "default" as const,
        label: "Completed",
      };
    case InvoiceStatus.FAILED:
      return {
        icon: <IconX className="size-3 text-red-500" />,
        variant: "destructive" as const,
        label: "Failed",
      };
    case InvoiceStatus.CANCELLED:
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

// Invoice detail view component
function InvoiceDetailView({ item }: { item: Invoice }) {
  const statusDisplay = getStatusDisplay(item.status);

  return (
    <>
      <DrawerHeader className="gap-1">
        <DrawerTitle className="flex items-center justify-between">
          <div className="flex items-center text-lg">
            <span className="font-medium">Invoice Details - </span>
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
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="payerName">Payer Name</Label>
              <Input id="payerName" defaultValue={item.name} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="targetChain">Target Chain</Label>
              <Input
                id="targetChain"
                defaultValue={item.preferredChain}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="targetToken">Target Token</Label>
              <Input
                id="targetToken"
                defaultValue={item.preferredToken}
                readOnly
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              // defaultValue={formatAmount(item.amount, item.targetToken)}
              // readOnly
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="details">Details</Label>
            <Input id="details" defaultValue={item.details || ""} readOnly />
          </div>
        </div>
      </div>
      <DrawerFooter>
        <Button>Update Invoice</Button>
      </DrawerFooter>
    </>
  );
}

// Invoice columns definition
export const invoiceColumns: ColumnDef<Invoice>[] = [
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
    header: "Invoice ID",
    cell: ({ row }) => {
      return (
        <TableCellViewer
          item={row.original}
          detailView={InvoiceDetailView}
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
        <div className="font-medium">{row.original.name || "Unknown"}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusDisplay = getStatusDisplay(row.original.status);
      return (
        <Badge variant={"outline"} className="px-1.5 text-zinc-600">
          {statusDisplay.icon}
          {statusDisplay.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "targetChain",
    header: "Preferred Chain",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {getChainInfo(row.original.preferredChain).name}
      </div>
    ),
  },
  {
    accessorKey: "targetToken",
    header: "Preferred Token",
    cell: ({ row }) => (
      <TokenCell
        token={row.original.preferredToken}
        chain={row.original.preferredChain}
      />
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="w-full text-right">Amount</div>,
    cell: ({ row }) => (
      <TokenCell
        token={row.original.preferredToken}
        chain={row.original.preferredChain}
        amount={Number(row.original.amount)}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "CreatedAt",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "link",
    header: "Payment Link",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-fit">
        <CopyToClipboard
          text={`${window.location.origin}/invoice/${row.original.userId}/${row.original.id}`}
          onCopy={() => toast.success("Copied to clipboard")}
        >
          <Button variant="ghost" size={"icon"} className="size-6">
            <IconCopy className="size-3 " />
          </Button>
        </CopyToClipboard>
        <Link
          href={`/invoice/${row.original.userId}/${row.original.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            size={"sm"}
            className="text-xs text-zinc-600"
          >
            <IconExternalLink className="size-3" />
            Link
          </Button>
        </Link>
      </div>
    ),
  },
];
