"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { payoutColumns } from "@/components/payout-columns";
import { SectionCards } from "@/components/section-cards";
import { Api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

const DashboardPage = () => {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await Api.get("/user");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards user={userData} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold px-4 lg:px-6">Recent Payouts</h2>
        <DataTable
          data={userData?.payouts ?? []}
          columns={payoutColumns}
          enablePagination={false}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
