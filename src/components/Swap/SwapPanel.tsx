"use client"

import React, { useEffect } from "react"
import Exchange from "../svgs/Exchange"
import SwapSide from "./SwapSide"
import useSwapParams from "../../hooks/useSwapParams"
import SwapButton from "./SwapButton"
import useSwapTrade from "@/hooks/useSwapTrade"
import { Amount, tryParseAmount } from "@/packages/currency"
import SettingPopup from "../SettingPopup"
import SwapDetails from "./SwapDetails"
import SwapTrades from "./SwapTrades"

const SwapPanel = () => {
  const {
    amountIn,
    setAmountIn,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    switchToken,
  } = useSwapParams()

  const trade = useSwapTrade()

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-[650px] lg:w-[50%] md:pt-20 pt-10 w-[90%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              data-active={true}
              className="bg-transparent border border-[#e2cdae] rounded-full text-[#1f1d1a] py-3 px-4 data-[active=true]:bg-[#e4e4e4] font-semibold"
            >
              Swap
            </button>
            <button
              data-active={false}
              className="bg-transparent border border-[#e2cdae] rounded-full text-[#afa392] data-[active=true]:text-[#1f1d1a] py-3 px-4 data-[active=true]:bg-[#e4e4e4] font-semibold"
            >
              Buy
            </button>
            <button
              data-active={false}
              className="bg-transparent border border-[#e2cdae] rounded-full text-[#afa392] data-[active=true]:text-[#1f1d1a] py-3 px-4 data-[active=true]:bg-[#e4e4e4] font-semibold"
            >
              Limit Order
            </button>
          </div>
          <SettingPopup />
        </div>

        <div className="bg-[#e4e4e4] relative p-4 md:p-8 mt-4 border border-[#e2cdae] rounded-lg md:rounded-[32px]">
          <SwapSide
            side="From"
            token={tokenIn}
            setToken={setTokenIn}
            amount={amountIn}
            setAmount={setAmountIn}
            price={trade.data?.[0]?.amountInValue}
          />

          <div className="flex items-center w-full justify-center">
            <div className="border border-[#e2cdae] w-full"></div>
            <button
              className="flex items-center justify-center rounded-full h-10 min-w-10 w-10 hover:bg-[#E2E8F0] transition-all mx-1"
              onClick={switchToken}
            >
              <Exchange className="h-4 w-4 text-[#1f1d1a]" />
            </button>
            <div className="border border-[#e2cdae] w-full"></div>
          </div>

          <SwapSide
            side="To"
            token={tokenOut}
            setToken={setTokenOut}
            amount={
              trade.data?.[0]?.amountOut && tokenOut && amountIn.length > 0
                ? Amount.fromRawAmount(
                    tokenOut,
                    trade.data?.[0]?.amountOut
                  ).toExact()
                : undefined
            }
            price={trade.data?.[0]?.amountOutValue}
          />
          <SwapDetails trade={trade} />
          <SwapTrades trades={trade.data} />
          <SwapButton trade={trade} />
        </div>
      </div>
    </div>
  )
}

export default SwapPanel
