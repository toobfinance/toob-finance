"use client";

import React, { useEffect, useState } from "react";
import Exchange from "../svgs/Exchange";
import SwapSide from "./SwapSide";
import useSwapParams from "../../hooks/useSwapParams";
import SwapButton from "./SwapButton";
import useSwapTrade from "@/hooks/useSwapTrade";
import { Amount } from "@/packages/currency";
import SwapDetails from "./SwapDetails";
import SwapTrades from "./SwapTrades";

const SwapPanel = () => {
  const {
    amountIn,
    setAmountIn,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    switchToken,
  } = useSwapParams();
  const trade = useSwapTrade();
  const [lockedRouter, setLockedRouter] = useState<any>(null);

  return (
    <div className="dark:bg-[linear-gradient(180deg,#000000_52%,rgba(47,54,61,0.3)_100%)] relative p-4 md:p-8 mt-4 border border-black/30 dark:border-white/20 rounded-lg md:rounded-[32px]">
      <SwapSide
        side="From"
        token={tokenIn}
        setToken={setTokenIn}
        amount={amountIn}
        setAmount={setAmountIn}
        price={trade.data?.[0]?.amountInValue.toString()}
      />

      <div className="flex items-center w-full justify-center">
        <div className="border border-black dark:border-white w-full"></div>
        <button
          className="flex items-center justify-center rounded-full h-10 min-w-10 w-10 hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black transition-all mx-1 border border-black dark:border-white"
          onClick={switchToken}
        >
          <Exchange className="h-4 w-4" />
        </button>
        <div className="border border-black dark:border-white w-full"></div>
      </div>

      <SwapSide
        side="To"
        token={tokenOut}
        setToken={setTokenOut}
        disabled
        amount={
          trade.data?.[0]?.amountOut && tokenOut && amountIn.length > 0
            ? Amount.fromRawAmount(
                tokenOut,
                trade.data?.[0]?.amountOut
              ).toExact()
            : undefined
        }
        price={trade.data?.[0]?.amountOutValue.toString()}
      />
      <SwapDetails trade={trade} />
      <SwapTrades trades={trade.data} lockedRouter={lockedRouter} />
      <SwapButton
        trade={trade}
        setLockedRouter={setLockedRouter}
        lockedRouter={lockedRouter}
      />
    </div>
  );
};

export default SwapPanel;
