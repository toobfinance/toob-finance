"use client";

import { SettingsProvider } from "@/hooks/useSettings";
import { SwapParamsProvider } from "@/hooks/useSwapParams";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { WagmiProvider, cookieStorage, createStorage } from "wagmi";
import { arbitrum } from "wagmi/chains";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "ToobFinance",
  description: "Toob Finance",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [arbitrum] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const queryClient = new QueryClient();

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: false,
  themeMode: "light",
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <SwapParamsProvider>{children}</SwapParamsProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
