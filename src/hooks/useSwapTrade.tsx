import { useAccount } from "wagmi"
import useSwapParams from "./useSwapParams"
import { useDebounce } from "./useDebounce"
import { tryParseAmount } from "@/packages/currency"
import { useClientTrade } from "@/packages/trade"
import { ChainId } from "@/packages/chain"
import { ZERO } from "@/packages/math"
import useSettings from "./useSettings"

const useSwapTrade = () => {
  const { amountIn, amountOut, tokenIn, tokenOut } = useSwapParams()
  const { address } = useAccount()
  const { slippage } = useSettings()

  const parsedAmount = useDebounce(tryParseAmount(amountIn, tokenIn), 200)

  const clientTrade = useClientTrade({
    chainId: ChainId.ARBITRUM_ONE,
    fromToken: tokenIn,
    toToken: tokenOut,
    amount: parsedAmount,
    slippagePercentage: slippage.toString(),
    recipient: address,
    maxFlowNumber: 100,
    enabled: Boolean(parsedAmount?.greaterThan(ZERO)),
  })

  return clientTrade
}

export default useSwapTrade
