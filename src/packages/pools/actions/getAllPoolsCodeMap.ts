import { DataFetcher, LiquidityProviders, PoolCode } from "../../router"

import { UsePoolsParams } from "../types"

export const getAllPoolsCodeMap = async ({
  currencyA,
  currencyB,
  chainId,
  providers,
}: Omit<UsePoolsParams, "enabled"> & { providers?: LiquidityProviders[] }) => {
  if (!currencyA || !currencyB || !chainId) {
    return new Map<string, PoolCode>()
  }

  const liquidityProviders = providers
    ? providers
    : [
        LiquidityProviders.SushiSwapV2,
        LiquidityProviders.SushiSwapV3,
        LiquidityProviders.UniSwapV2,
        LiquidityProviders.UniSwapV3,
        // LiquidityProviders.CamelotSwapV2,
        LiquidityProviders.CamelotSwapV3,
        LiquidityProviders.PancakeSwapV2,
        LiquidityProviders.PancakeSwapV3,
        // LiquidityProviders.TraderJoe,
      ]

  const dataFetcher = DataFetcher.onChain(chainId)
  // console.log('dataFetcher startDataFetching')
  dataFetcher.startDataFetching(liquidityProviders)

  await dataFetcher.fetchPoolsForToken(currencyA, currencyB)
  // console.log('dataFetcher stopDataFetching')
  dataFetcher.stopDataFetching()

  return dataFetcher.getCurrentPoolCodeMap(currencyA, currencyB)
}
