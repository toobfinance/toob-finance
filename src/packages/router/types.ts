import { routeProcessor2Abi } from "../abi"
import { ChainId } from "../chain"
import { Amount, Price, type Type } from "../currency"
import { Percent } from "../math"
import type { Address } from "viem"

import type { LiquidityProviders } from "./liquidity-providers"
import { MultiRoute } from "../tines"

export interface UseTradeParams {
  chainId: ChainId
  fromToken: Type | undefined
  toToken: Type | undefined
  amount: Amount<Type> | undefined
  slippagePercentage: string
  recipient: Address | undefined
  enabled: boolean
  maxFlowNumber?: number
  providers?: LiquidityProviders[]
  onError?(e: Error): void
}

export interface UseTradeReturn {
  swapPrice: Price<Type, Type> | undefined
  priceImpact: Percent | undefined
  amountIn: Amount<Type> | undefined
  amountOut: Amount<Type> | undefined
  minAmountOut: Amount<Type> | undefined
  feeAmount: Amount<Type> | undefined
  bestSingleAmountOut: Amount<Type> | undefined
  bestSingleDex: string | undefined
  gasSpent: string | undefined
  functionName: "toobExecute" | "transferValueAndtoobExecute"
  writeArgs: any
  route: MultiRoute
  value?: bigint | undefined
}
