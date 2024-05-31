"use client"

import { useState } from "react"
import ChevronDown from "../svgs/ChevronDown"
import { Amount } from "@/packages/currency"

interface SwapTradesProps {
  trades: any
}

const SwapTrades: React.FC<SwapTradesProps> = ({ trades }) => {
  const [open, setOpen] = useState(false)

  const sortTrades = trades
    ?.filter((item: any) => item)
    ?.sort((a: any, b: any) =>
      BigInt(a?.amountOut ?? "0") > BigInt(b?.amountOut ?? "0") ? -1 : 1
    )

  return sortTrades?.length > 0 ? (
    <div
      data-open={open}
      className="flex flex-col border border-[#e2cdae] rounded-2xl px-4 data-[open=false]:border-transparent transition-all data-[open=false]:mt-2 mt-4 data-[open=true]:pt-3"
    >
      <div
        data-open={open}
        className="max-h-0 overflow-hidden data-[open=true]:max-h-[300px] transition-all"
      >
        <div className="w-full flex flex-col space-y-1">
          {sortTrades.map((item: any) => (
            <div
              key={item.type}
              className="flex items-center justify-between first:font-bold text-[#7C7872] first:text-[#1F1D1A] text-sm"
            >
              <span className="no-underline">
                {Amount.fromRawAmount(
                  item.tokenOut,
                  item.amountOut
                ).toSignificant(6)}{" "}
                {item.tokenOut?.symbol}
              </span>
              <span className="">{item.type}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center"
        onClick={() => setOpen(!open)}
      >
        <div
          data-open={open}
          className="flex items-center justify-center w-fit border border-[#e2cdae] px-3 rounded-full data-[open=true]:border-transparent transition-all"
        >
          <span className="text-[#1f1d1a] font-bold text-sm">Route</span>
          <div
            data-open={open}
            className="w-fit data-[open=true]:rotate-180 transition-all"
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#1f1d1a]" />
          </div>
        </div>
      </button>
    </div>
  ) : null
}

export default SwapTrades
