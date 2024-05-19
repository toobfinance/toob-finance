import { ChainId } from "../chain"
import {
  ARB,
  DAI,
  Token,
  USDC,
  USDCe,
  USDT,
  WBTC,
  WETH9,
  WNATIVE,
} from "../currency"

export const BASES_TO_CHECK_TRADES_AGAINST: {
  readonly [chainId: number]: Token[]
} = {
  [ChainId.ARBITRUM_ONE]: [
    WNATIVE[ChainId.ARBITRUM_ONE],
    // WBTC[ChainId.ARBITRUM_ONE],
    USDC[ChainId.ARBITRUM_ONE],
    USDT[ChainId.ARBITRUM_ONE],
    USDCe[ChainId.ARBITRUM_ONE],
    // DAI[ChainId.ARBITRUM_ONE],
    ARB[ChainId.ARBITRUM_ONE],
  ],
}
