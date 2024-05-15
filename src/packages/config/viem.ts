import { ChainId } from "../chain"
import { http, type PublicClientConfig } from "viem"
import { arbitrum, arbitrumNova, polygon, bsc, avalanche } from "viem/chains"

export { arbitrumNova, polygon, arbitrum, bsc, avalanche }

const drpcId = process.env["DRPC_ID"] || process.env["NEXT_PUBLIC_DRPC_ID"]

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
} as const
