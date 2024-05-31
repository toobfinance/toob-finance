import { useAccount } from "wagmi"
import useSwapParams from "./useSwapParams"
import { useDebounce } from "./useDebounce"
import { tryParseAmount } from "@/packages/currency"
import { ZERO } from "@/packages/math"
import useSettings from "./useSettings"
import { useQuery } from "@tanstack/react-query"
import { getKyberTrade, getOdosTrade, getXFusionTrade } from "@/utils/trade"
import { usePoolsCodeMap } from "@/packages/pools"
import { ChainId } from "@/packages/chain"

const useSwapTrade = () => {
  const { amountIn, tokenIn, tokenOut } = useSwapParams()
  const { address } = useAccount()
  const { slippage } = useSettings()

  const parsedAmount = useDebounce(tryParseAmount(amountIn, tokenIn), 200)

  const { data: poolsCodeMap } = usePoolsCodeMap({
    chainId: ChainId.ARBITRUM_ONE,
    currencyA: tokenIn,
    currencyB: tokenOut,
    enabled: Boolean(parsedAmount?.greaterThan(0)),
  })

  const trade = useQuery({
    queryKey: [
      "smart-router",
      tokenIn,
      tokenOut,
      parsedAmount,
      slippage,
      poolsCodeMap,
    ],
    queryFn: async () => {
      try {
        if (
          !tokenIn ||
          !tokenOut ||
          !parsedAmount ||
          !parsedAmount.greaterThan(ZERO)
        ) {
          return undefined
        }

        const trades = await Promise.all([
          getOdosTrade(
            tokenIn,
            tokenOut,
            address ?? "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
            slippage,
            parsedAmount.quotient.toString()
          ),
          getKyberTrade(
            tokenIn,
            tokenOut,
            address ?? "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
            slippage,
            parsedAmount.quotient.toString()
          ),
          getXFusionTrade(
            tokenIn,
            tokenOut,
            address ?? "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
            slippage * 2,
            parsedAmount.quotient.toString(),
            poolsCodeMap
          ),
        ])

        return trades
          ?.filter((item: any) => item && BigInt(item?.amountOut ?? "0") > 0n)
          ?.sort((a: any, b: any) =>
            BigInt(a?.amountOut ?? "0") > BigInt(b?.amountOut ?? "0") ? -1 : 1
          )
      } catch (err) {
        console.log(err)
      }
    },
    refetchInterval: 15000,
    enabled:
      Boolean(tokenIn) &&
      Boolean(tokenOut) &&
      Boolean(parsedAmount?.greaterThan(ZERO)),
    refetchOnWindowFocus: false,
  })
  return trade
}

export default useSwapTrade
