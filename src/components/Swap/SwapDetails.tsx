import { UseQueryResult } from "@tanstack/react-query"
import ChevronDown from "../svgs/ChevronDown"
import { useState } from "react"
import { Amount, Price } from "@/packages/currency"
import useSwapParams from "@/hooks/useSwapParams"
import useSettings from "@/hooks/useSettings"

interface SwapDetailsProps {
  trade: UseQueryResult<any, Error>
}

const SwapDetails: React.FC<SwapDetailsProps> = ({ trade }) => {
  const [open, setOpen] = useState(false)
  const [reverted, setReverted] = useState(false)
  const { tokenIn, tokenOut } = useSwapParams()
  const { slippage } = useSettings()

  const swapPrice =
    trade.data && tokenIn && tokenOut
      ? new Price(
          tokenIn,
          tokenOut,
          trade.data?.inAmounts?.[0] ?? "0",
          trade.data?.outAmounts?.[0] ?? "0"
        )
      : undefined

  return trade.data && tokenIn && tokenOut ? (
    <div className="mt-4 border rounded-2xl px-4 border-[#e2cdae]">
      <div className="relative min-h-10 flex items-center justify-between cursor-pointer">
        <button
          className="text-[#1f1d1a] text-sm font-semibold z-[1]"
          onClick={() => setReverted(!reverted)}
        >
          1 {!reverted ? tokenIn.symbol : tokenOut.symbol} ={" "}
          {!reverted
            ? swapPrice?.toSignificant(9)
            : swapPrice?.invert()?.toSignificant(9)}{" "}
          {!reverted ? tokenOut.symbol : tokenIn.symbol}
        </button>
        <button
          className="absolute top-0 left-0 right-0 bottom-0 w-full h-full"
          onClick={() => setOpen(!open)}
        ></button>
        <ChevronDown className="w-3.5 h-3.5 text-[#1f1d1a]" />
      </div>
      <div
        data-open={open}
        className="max-h-0 data-[open=true]:max-h-[300px] transition-all overflow-hidden"
      >
        <div className="gap-0.5 pt-4 pb-6">
          <div className="flex items-start justify-between">
            <span className="text-[#7c7872] text-sm">Expected Output:</span>
            <span className="text-[#1f1d1a] text-sm font-semibold">
              {Amount.fromRawAmount(
                tokenOut,
                trade.data?.outAmounts?.[0] ?? "0"
              ).toSignificant(6)}{" "}
              {tokenOut.symbol}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[#7c7872] text-sm">Minimum Received:</span>
            <span className="text-[#1f1d1a] text-sm font-semibold">
              {Amount.fromRawAmount(
                tokenOut,
                (BigInt(trade.data?.outAmounts?.[0] ?? "0") *
                  (1000000n - BigInt(slippage * 10000))) /
                  1000000n
              ).toSignificant(6)}{" "}
              {tokenOut.symbol}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[#7c7872] text-sm">Price Impact:</span>
            <span className="text-[#1f1d1a] text-sm font-semibold">
              {(trade.data?.priceImpact ?? 0) < 0.01
                ? "<0.01%"
                : `${(trade.data?.priceImpact ?? 0).toFixed(2)}%`}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[#7c7872] text-sm">Fees:</span>
            <span className="text-[#1f1d1a] text-sm font-semibold">0 ETH</span>
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default SwapDetails
