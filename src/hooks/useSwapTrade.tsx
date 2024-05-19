import { useAccount } from "wagmi"
import useSwapParams from "./useSwapParams"
import { useDebounce } from "./useDebounce"
import { Token, tryParseAmount } from "@/packages/currency"
import { useClientTrade } from "@/packages/trade"
import { ChainId } from "@/packages/chain"
import { ZERO } from "@/packages/math"
import useSettings from "./useSettings"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const useSwapTrade = () => {
  const { amountIn, amountOut, tokenIn, tokenOut } = useSwapParams()
  const { address } = useAccount()
  const { slippage } = useSettings()

  const parsedAmount = useDebounce(tryParseAmount(amountIn, tokenIn), 200)

  // const clientTrade = useClientTrade({
  //   chainId: ChainId.ARBITRUM_ONE,
  //   fromToken: tokenIn,
  //   toToken: tokenOut,
  //   amount: parsedAmount,
  //   slippagePercentage: slippage.toString(),
  //   recipient: address,
  //   maxFlowNumber: 1500,
  //   enabled: Boolean(parsedAmount?.greaterThan(ZERO)),
  // })

  // return clientTrade
  const trade = useQuery({
    queryKey: ["smart-router", tokenIn, tokenOut, parsedAmount, slippage],
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

        const { data } = await axios.post("https://api.odos.xyz/sor/quote/v2", {
          chainId: 42161,
          inputTokens: [
            {
              tokenAddress:
                tokenIn instanceof Token
                  ? tokenIn.address
                  : "0x0000000000000000000000000000000000000000",
              amount: parsedAmount.quotient.toString(),
            },
          ],
          outputTokens: [
            {
              tokenAddress:
                tokenOut instanceof Token
                  ? tokenOut.address
                  : "0x0000000000000000000000000000000000000000",
              proportion: 1,
            },
          ],
          userAddr: address,
          slippageLimitPercent: slippage,
          pathViz: true,
          referralCode: 0,
          compact: true,
          likeAsset: true,
          disableRFQs: false,
        })

        console.log(data)
        return data
      } catch (err) {
        console.log(err)
      }
    },
    refetchInterval: 20000,
    enabled:
      Boolean(tokenIn) &&
      Boolean(tokenOut) &&
      Boolean(parsedAmount?.greaterThan(ZERO)),
    refetchOnWindowFocus: false,
  })
  return trade
}

export default useSwapTrade
