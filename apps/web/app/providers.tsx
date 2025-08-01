"use client";

import { type Config, cookieToInitialState, WagmiProvider } from "wagmi";
import { wagmiAdapter } from "@/lib/appkit-config";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config);

  const queryClient = new QueryClient();

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
