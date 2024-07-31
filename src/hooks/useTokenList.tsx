import { ChainId } from "@/packages/chain";
import {
  DEFAULT_SANKO_TOKEN_LIST,
  DEFAULT_TOKEN_LIST,
  PRIMARY_SANKO_TOKEN_LIST,
  PRIMARY_TOKEN_LIST,
} from "@/packages/config";
import { Native, Token } from "@/packages/currency";

export const useTokenList = (primaryTokens?: boolean) => {
  const defaultTokens = (
    primaryTokens ? PRIMARY_TOKEN_LIST : DEFAULT_TOKEN_LIST
  ).map((item) =>
    item.native || !item.address
      ? Native.onChain(ChainId.ARBITRUM_ONE)
      : new Token({
          chainId: ChainId.ARBITRUM_ONE,
          address: item.address,
          decimals: item.decimals,
          name: item.name,
          symbol: item.symbol,
          icon: item.icon,
          category: item.category,
        })
  );

  return defaultTokens;
};

export const useSankoTokenList = (primaryTokens?: boolean) => {
  const defaultTokens = (
    primaryTokens ? PRIMARY_SANKO_TOKEN_LIST : DEFAULT_SANKO_TOKEN_LIST
  ).map((item) =>
    item.native || !item.address
      ? Native.onChain(ChainId.SANKO_MAINNET)
      : new Token({
          chainId: ChainId.SANKO_MAINNET,
          address: item.address,
          decimals: item.decimals,
          name: item.name,
          symbol: item.symbol,
          icon: item.icon,
          category: item.category,
        })
  );

  return defaultTokens;
};
