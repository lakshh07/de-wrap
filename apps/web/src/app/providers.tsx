"use client";

import { type Config, cookieToInitialState, WagmiProvider } from "wagmi";
import { wagmiAdapter } from "@/lib/appkit-config";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <NextTopLoader showSpinner={false} shadow={false} color="#000000" />
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
