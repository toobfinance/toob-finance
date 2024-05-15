import { ChainId } from "../../chain"
import { Type } from "../../currency"
import { TradeType } from "../../dex"

export enum PoolType {
  Pool = "SwapV2",
}

export interface UsePoolsParams {
  chainId: ChainId
  currencyA: Type | undefined
  currencyB: Type | undefined
  tradeType?: TradeType
  enabled?: boolean
  withCombinations?: boolean
}
