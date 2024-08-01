import { ChainId } from "../../chain/index";
import { Native } from "../Native";

export const defaultQuoteCurrency = {
  [ChainId.ARBITRUM_ONE]: Native.onChain(ChainId.ARBITRUM_ONE),
  [ChainId.SANKO_MAINNET]: Native.onChain(ChainId.SANKO_MAINNET),
} as const;
