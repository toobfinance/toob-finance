import { ChainId } from "../../chain"

export const ARB_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0x912CE59144191C1204E64559FE8253a0e49E6548",
} as const

export const WBTC_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
} as const

export const WETH9_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
} as const

export const WDMT_ADDRESS = {
  [ChainId.SANKO_MAINNET]: "0x754cDAd6f5821077d6915004Be2cE05f93d176f8",
} as const

export const WNATIVE_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: WETH9_ADDRESS[ChainId.ARBITRUM_ONE],
  [ChainId.SANKO_MAINNET]: WDMT_ADDRESS[ChainId.SANKO_MAINNET],
} as const

export const USDC_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [ChainId.SANKO_MAINNET]: "0x13D675BC5e659b11CFA331594cF35A20815dCF02",
} as const

export const USDCe_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
} as const

export const USDT_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
} as const

export const DAI_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
} as const

export const TOOB_ADDRESS = {
  [ChainId.ARBITRUM_ONE]: "0x676F7ED2D4829460f73468b36Be49e0D6505107F",
} as const
