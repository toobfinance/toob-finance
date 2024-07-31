"use client";

import { useState } from "react";
import ChevronDown from "../svgs/ChevronDown";
import { Amount } from "@/packages/currency";

interface SwapTradesProps {
  trades: any;
  lockedRouter: any;
}

const SwapTrades: React.FC<SwapTradesProps> = ({ trades, lockedRouter }) => {
  const [open, setOpen] = useState(false);

  const sortTrades = trades
    ?.filter((item: any) => item)
    ?.sort((a: any, b: any) =>
      BigInt(a?.amountOut ?? "0") > BigInt(b?.amountOut ?? "0") ? -1 : 1
    );

  return sortTrades?.length > 0 ? (
    <div
      data-open={open}
      className="flex flex-col border border-black/30 dark:border-white/20 rounded-2xl px-4 data-[open=false]:border-transparent transition-all data-[open=false]:mt-2 mt-4 data-[open=true]:pt-3"
    >
      <div
        data-open={open}
        className="max-h-0 overflow-hidden data-[open=true]:max-h-[300px] transition-all"
      >
        <div className="w-full flex flex-col space-y-1">
          {sortTrades.map((item: any, index: number) => {
            const isLocked = lockedRouter
              ? item.type === lockedRouter.type
              : index === 0;

            return (
              <div
                key={item.type}
                className={`flex items-center justify-between text-sm ${
                  isLocked ? "font-bold" : "text-black dark:text-white"
                }`}
              >
                <span className="no-underline">
                  {Amount.fromRawAmount(
                    item.tokenOut,
                    item.amountOut
                  ).toSignificant(6)}{" "}
                  {item.tokenOut?.symbol}
                </span>
                <span>{item.type}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center"
        onClick={() => setOpen(!open)}
      >
        <div
          data-open={open}
          className="flex items-center justify-center w-fit border border-black/30 dark:border-white/20 px-3 rounded-full data-[open=true]:border-transparent transition-all"
        >
          <span className="text-black dark:text-white font-bold text-sm">
            Route
          </span>
          <div
            data-open={open}
            className="w-fit data-[open=true]:rotate-180 transition-all"
          >
            <ChevronDown className="w-3.5 h-3.5 text-black dark:text-white" />
          </div>
        </div>
      </button>
    </div>
  ) : null;
};

export default SwapTrades;
