import { ChainId } from "../../chain";

export const nativeCurrencyIds = {
  [ChainId.ARBITRUM_ONE]: "ETH",
  [ChainId.SANKO_MAINNET]: "DMT",
} as const;
