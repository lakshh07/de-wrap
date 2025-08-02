"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { UserMetric } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/lib/axios";

export const description =
  "An interactive area chart showing total balance over time";

const chartConfig = {
  balance: {
    label: "Total Balance",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90");

  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["metrics", timeRange],
    queryFn: async () => {
      const response = await Api.get<UserMetric[]>("/user/metric", {
        params: {
          type: "BALANCE",
          start: timeRange,
        },
      });
      return response.data;
    },
  });

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7");
    }
  }, [isMobile]);

  const balanceMetrics = React.useMemo(() => {
    if (!metrics) return [];

    const balanceData = metrics
      .filter((metric: UserMetric) => metric.type === "BALANCE")
      .map((metric: UserMetric) => ({
        date: new Date(metric.timestamp).toISOString().split("T")[0],
        balance: parseFloat(metric.value) || 0,
        timestamp: new Date(metric.timestamp).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const groupedData = balanceData.reduce(
      (acc, item) => {
        const dateKey = item.date;
        if (dateKey && acc[dateKey]) {
          acc[dateKey].balance += item.balance;
        } else if (dateKey) {
          acc[dateKey] = { ...item };
        }
        return acc;
      },
      {} as Record<string, (typeof balanceData)[0]>
    );

    return Object.values(groupedData);
  }, [metrics]);

  const filteredData = React.useMemo(() => {
    if (balanceMetrics.length === 0) return [];

    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30") {
      daysToSubtract = 30;
    } else if (timeRange === "7") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return balanceMetrics.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [balanceMetrics, timeRange]);

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>Loading balance data...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>Error loading balance data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Failed to load balance data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (balanceMetrics.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>No balance data available</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No balance metrics found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Balance</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Balance over time based on your metrics
          </span>
          <span className="@[540px]/card:hidden">Balance over time</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-balance)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-balance)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="balance"
              type="natural"
              fill="url(#fillBalance)"
              stroke="var(--color-balance)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
