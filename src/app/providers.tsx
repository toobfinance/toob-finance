"use client";

import { NetworkProvider } from "@/hooks/useNetwork";
import { SettingsProvider } from "@/hooks/useSettings";
import { SwapParamsProvider } from "@/hooks/useSwapParams";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { defineChain } from "viem";

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

export const sanko = defineChain({
  id: 1996,
  name: "Sanko Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "DMT",
    symbol: "DMT",
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.sanko.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.sanko.xyz" },
  },
});

const chains = [arbitrum, sanko] as const;

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
  defaultChain: chains[0],
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <NetworkProvider>
            <SwapParamsProvider>{children}</SwapParamsProvider>
          </NetworkProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
