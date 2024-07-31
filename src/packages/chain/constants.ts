export const ChainId = {
  ARBITRUM_ONE: 42161,
  SANKO_MAINNET: 1996,
} as const;

export type ChainId = (typeof ChainId)[keyof typeof ChainId];

export const isChainId = (chainId: number | undefined): chainId is ChainId => {
  return Object.values(ChainId).includes(chainId as ChainId);
};

export const ChainKey = {
  [ChainId.ARBITRUM_ONE]: "arbitrum-one",
  [ChainId.SANKO_MAINNET]: "sanko-mainnet",
} as const;

export type ChainKey = (typeof ChainKey)[keyof typeof ChainKey];
