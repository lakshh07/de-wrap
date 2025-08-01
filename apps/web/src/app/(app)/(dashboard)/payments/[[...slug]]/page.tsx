"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { payoutColumns } from "@/components/payout-columns";
import { invoiceColumns } from "@/components/invoice-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Invoice, Payout } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface PaymentsPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

type Payment = Payout & {
  invoice: Invoice;
};

const PaymentsPage = ({ params }: PaymentsPageProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("payments");

  const unwrappedParams = React.use(params);

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await axios.get<Payment[]>("/api/payment");
      return res.data;
    },
    refetchOnMount: true,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await axios.get<Invoice[]>("/api/invoice");
      return res.data;
    },
    refetchOnMount: true,
  });

  useEffect(() => {
    const slug = unwrappedParams.slug;
    if (slug && slug[0] === "invoices") {
      setActiveTab("invoices");
    } else {
      setActiveTab("payments");
    }
  }, [unwrappedParams.slug]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "invoices") {
      router.push("/payments/invoices");
    } else {
      router.push("/payments");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
        </div>
        <Link href="/invoices/new" className="">
          <Button className="bg-black text-white hover:bg-gray-800">
            + Create invoice
          </Button>
        </Link>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="payments" className="cursor-pointer">
            Payouts
          </TabsTrigger>
          <TabsTrigger value="invoices" className="cursor-pointer">
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          {paymentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
              </div>
            </div>
          ) : (
            <DataTable
              data={payments || []}
              columns={payoutColumns}
              pageSize={10}
              enableDragAndDrop={true}
              enableRowSelection={true}
              enablePagination={true}
            />
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          {invoicesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
              </div>
            </div>
          ) : (
            <DataTable
              data={invoices || []}
              columns={invoiceColumns}
              pageSize={10}
              enableDragAndDrop={true}
              enableRowSelection={true}
              enablePagination={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsPage;
