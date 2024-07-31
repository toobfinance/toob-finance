import { sanko } from "@/app/providers";
import { ChainId } from "../chain";
import { http, type PublicClientConfig } from "viem";
import { arbitrum, arbitrumNova, polygon, bsc, avalanche } from "viem/chains";

export { arbitrumNova, polygon, arbitrum, bsc, avalanche };

export const config: Record<ChainId, PublicClientConfig[]> = {
  [ChainId.ARBITRUM_ONE]: [
    {
      chain: arbitrum,
      transport: http(
        `https://g.w.lavanet.xyz:443/gateway/arb1/rpc-http/33bd6b0a35153600050710e994eb33a9`
      ),
    },
    {
      chain: arbitrum,
      transport: http(`https://arb1.arbitrum.io/rpc`),
    },
    {
      chain: arbitrum,
      transport: http(`https://rpc.ankr.com/arbitrum`),
    },
  ],
  [ChainId.SANKO_MAINNET]: [
    {
      chain: sanko,
      transport: http("https://mainnet.sanko.xyz"),
    },
  ],
} as const;
