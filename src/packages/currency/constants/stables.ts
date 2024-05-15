import { ChainId } from "../../chain"
import { DAI, USDC, USDCe, USDT } from "./tokens"

export const STABLES = {
  [ChainId.ARBITRUM_ONE]: [
    USDC[ChainId.ARBITRUM_ONE],
    USDCe[ChainId.ARBITRUM_ONE],
    USDT[ChainId.ARBITRUM_ONE],
    DAI[ChainId.ARBITRUM_ONE],
  ],
} as const
