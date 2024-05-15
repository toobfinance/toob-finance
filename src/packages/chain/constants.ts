export const ChainId = {
  ARBITRUM_ONE: 42161,
} as const
export type ChainId = (typeof ChainId)[keyof typeof ChainId]

// export const isChainId = (chainId: number): chainId is ChainId => Object.values(ChainId).includes(chainId as ChainId)

export const ChainKey = {
  [ChainId.ARBITRUM_ONE]: "arbitrum-one",
} as const
export type ChainKey = (typeof ChainKey)[keyof typeof ChainKey]
