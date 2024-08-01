import { ChainId } from "../../chain";

import { Native } from "../Native";
import { type Type } from "../Type";
import { ARB, DAI, USDC, USDT, WBTC, WETH9, WNATIVE, TOOB } from "./tokens";

const CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY = {
  [ChainId.ARBITRUM_ONE]: {
    ETH: Native.onChain(ChainId.ARBITRUM_ONE),
    WETH: WNATIVE[ChainId.ARBITRUM_ONE],
    WBTC: WBTC[ChainId.ARBITRUM_ONE],
    USDC: USDC[ChainId.ARBITRUM_ONE],
    USDT: USDT[ChainId.ARBITRUM_ONE],
    DAI: DAI[ChainId.ARBITRUM_ONE],
    TOOB: TOOB[ChainId.ARBITRUM_ONE],
    ARB: ARB[ChainId.ARBITRUM_ONE],
  },
  [ChainId.SANKO_MAINNET]: {
    DMT: Native.onChain(ChainId.SANKO_MAINNET),
    WDMT: WNATIVE[ChainId.SANKO_MAINNET],
    USDC: USDC[ChainId.SANKO_MAINNET],
  },
} as const;

export type ShortCurrencyNameChainId =
  keyof typeof CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY;

export type ShortCurrencyName =
  keyof (typeof CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY)[ShortCurrencyNameChainId];

export const isShortCurrencyNameSupported = (
  chainId: ChainId
): chainId is ShortCurrencyNameChainId =>
  chainId in CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY;

export const isShortCurrencyName = (
  chainId: ChainId,
  shortCurrencyName: string
): shortCurrencyName is ShortCurrencyName => {
  return (
    isShortCurrencyNameSupported(chainId) &&
    shortCurrencyName in CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY[chainId]
  );
};

export const currencyFromShortCurrencyName = (
  chainId: ChainId,
  shortCurrencyName: ShortCurrencyName
): Type => {
  if (!isShortCurrencyNameSupported(chainId))
    throw new Error(
      `Unsupported chain id ${chainId} for short currency name ${shortCurrencyName}`
    );
  if (!(shortCurrencyName in CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY[chainId]))
    throw new Error(
      `Unsupported short currency name ${shortCurrencyName} on chain ${chainId}`
    );
  return CHAIN_ID_SHORT_CURRENCY_NAME_TO_CURRENCY[chainId][shortCurrencyName];
};
