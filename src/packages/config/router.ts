import { ChainId } from "../chain";
import { ARB, Token, USDC, USDCe, USDT, WNATIVE } from "../currency";

export const BASES_TO_CHECK_TRADES_AGAINST: {
  readonly [chainId: number]: Token[];
} = {
  [ChainId.ARBITRUM_ONE]: [
    WNATIVE[ChainId.ARBITRUM_ONE],
    USDC[ChainId.ARBITRUM_ONE],
    USDT[ChainId.ARBITRUM_ONE],
    USDCe[ChainId.ARBITRUM_ONE],
    ARB[ChainId.ARBITRUM_ONE],
  ],
  [ChainId.SANKO_MAINNET]: [
    WNATIVE[ChainId.SANKO_MAINNET],
    USDC[ChainId.SANKO_MAINNET],
  ],
};
