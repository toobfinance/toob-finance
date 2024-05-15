import { ChainId } from "../../chain"

import { Token } from "../Token"
import { addressMapToTokenMap } from "../functions/address-map-to-token-map"

import {
  ARB_ADDRESS,
  DAI_ADDRESS,
  USDC_ADDRESS,
  USDCe_ADDRESS,
  USDT_ADDRESS,
  WBTC_ADDRESS,
  WETH9_ADDRESS,
  WNATIVE_ADDRESS,
  TOOB_ADDRESS,
} from "./token-addresses"

export const ARB = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: "ARB",
    name: "Arbitrum",
    icon: "/media/arb.png",
  },
  ARB_ADDRESS
) as Record<keyof typeof ARB_ADDRESS, Token>

export const WBTC = addressMapToTokenMap(
  {
    decimals: 8,
    symbol: "WBTC",
    name: "Wrapped BTC",
    icon: "/media/wbtc.png",
  },
  WBTC_ADDRESS
) as Record<keyof typeof WBTC_ADDRESS, Token>

export const WETH9 = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped Ether",
    icon: "/media/weth.png",
  },
  WETH9_ADDRESS
) as Record<keyof typeof WETH9_ADDRESS, Token>

export const WNATIVE = {
  [ChainId.ARBITRUM_ONE]: WETH9[ChainId.ARBITRUM_ONE],
} as const

export const USDC: Record<keyof typeof USDC_ADDRESS, Token> = {
  ...(addressMapToTokenMap(
    {
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin",
      icon: "/media/usdc.png",
    },
    USDC_ADDRESS
  ) as Record<keyof typeof USDC_ADDRESS, Token>),
} as const

export const USDCe: Record<keyof typeof USDCe_ADDRESS, Token> = {
  ...(addressMapToTokenMap(
    {
      decimals: 6,
      symbol: "USDC.e",
      name: "Bridged USDC",
      icon: "/media/usdc.png",
    },
    USDCe_ADDRESS
  ) as Record<keyof typeof USDCe_ADDRESS, Token>),
} as const

export const USDT: Record<keyof typeof USDT_ADDRESS, Token> = {
  ...(addressMapToTokenMap(
    {
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
      icon: "/media/usdt.png",
    },
    USDT_ADDRESS
  ) as Record<keyof typeof USDT_ADDRESS, Token>),
}

export const DAI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: "DAI",
    name: "Dai Stablecoin",
    icon: "/media/dai.png",
  },
  DAI_ADDRESS
) as Record<keyof typeof DAI_ADDRESS, Token>

export const TOOB = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: "TOOB",
    name: "Toob",
    icon: "/media/toob.png",
  },
  TOOB_ADDRESS
) as Record<keyof typeof TOOB_ADDRESS, Token>
