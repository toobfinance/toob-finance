"use client";

import { useEffect, useRef, useState } from "react";
import ChevronDown from "../svgs/ChevronDown";
import TokenListModal from "../TokenListModal";
import { ARB, Amount, Token, Type, USDC, USDT } from "@/packages/currency";
import { DEFAULT_IMAGE_URL, NATIVE_GAS_FEE } from "@/constants";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import { ChainId } from "@/packages/chain";

interface SwapSideProps {
  side: "From" | "To";
  amount: string | undefined;
  setAmount?: any;
  token?: Type;
  setToken: any;
  className?: string;
  hideSide?: boolean;
  hideBalance?: boolean;
  disabled?: boolean;
  price?: string;
  primaryTokens?: boolean;
}

const SwapSide: React.FC<SwapSideProps> = ({
  side,
  amount,
  setAmount,
  token,
  price,
  setToken,
  hideBalance,
  hideSide,
  className,
  primaryTokens,
  disabled,
}) => {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tokenSelectorRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const fastTokens = !token;

  const { data: balance } = useBalance({
    address,
    token: token instanceof Token ? token.address : undefined,
    query: {
      enabled: Boolean(address) && Boolean(token),
      refetchInterval: 30000,
    },
  });

  const onMax = () => {
    if (balance && token) {
      if (token?.isNative) {
        setAmount?.(
          Amount.fromRawAmount(
            token,
            balance.value >= NATIVE_GAS_FEE
              ? balance.value - NATIVE_GAS_FEE
              : 0n
          ).toExact()
        );
      } else setAmount?.(Amount.fromRawAmount(token, balance.value).toExact());
    } else {
      setAmount?.("0");
    }
  };

  const onAmountInput = (e: string) => {
    if (
      e === "" ||
      RegExp(`^\\d*(?:\\\\[.])?\\d*$`).test(
        e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      )
    ) {
      setAmount(e);
    }
  };

  useEffect(() => {
    if (amountInputRef.current)
      amountInputRef.current.style.paddingRight = `${
        (tokenSelectorRef.current?.clientWidth ?? 0) + 10
      }px`;
  }, [token, balance]);

  return (
    <>
      <div className={className ?? ""}>
        <div className="flex items-start justify-between">
          {!hideSide && (
            <h2 className="text-[#afa392] font-semibold">{side}</h2>
          )}
          {!hideBalance && balance && token ? (
            <button
              className="text-xs text-[#31291e] px-2 h-6 font-semibold rounded-full hover:bg-[#EDF2F7] transition-all"
              disabled={side === "To"}
              onClick={onMax}
            >
              <span className="text-[#afa392] mr-1">Balance:</span>
              {Number(balance.formatted).toLocaleString("en-US", {
                maximumFractionDigits: 9,
              })}
            </button>
          ) : null}
        </div>
        <div className="relative mt-1">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            pattern="^[0-9]*[.,]?[0-9]*$"
            onChange={(e) => onAmountInput(e.target.value)}
            disabled={disabled}
            ref={amountInputRef}
            data-fast={fastTokens}
            className="w-full h-12 max-sm:data-[fast=true]:h-[72px] outline-none text-[30px] bg-transparent text-[#31291e] font-semibold placeholder:text-[#afa392]"
            placeholder="0.0"
          />
          <div
            ref={tokenSelectorRef}
            data-fast={fastTokens}
            className="flex max-sm:data-[fast=true]:flex-col max-sm:data-[fast=true]:items-end absolute max-sm:justify-center bottom-0 right-0 min-h-full items-center space-x-2 max-sm:data-[fast=true]:space-x-0"
          >
            {balance && side === "From" ? (
              <button
                className="text-[#31291e] text-xs font-semibold bg-[#f3f0ee] rounded-full h-6 px-2 py-1 hover:bg-[#e6e0d8] transition-all"
                onClick={onMax}
              >
                MAX
              </button>
            ) : null}
            {fastTokens ? (
              <div className="flex items-center space-x-2 max-sm:mb-2">
                <Image
                  src="/media/arb.png"
                  width={32}
                  height={32}
                  alt="arb"
                  className="w-8 h-8 rounded-full bg-[#f3f0ee] p-1 hover:bg-[#f1eadf] active:bg-[#e6e1d9] transition-all cursor-pointer"
                  onClick={() => setToken(ARB[ChainId.ARBITRUM_ONE])}
                />
                <Image
                  src="/media/usdc.png"
                  width={32}
                  height={32}
                  alt="usdc"
                  className="w-8 h-8 rounded-full bg-[#f3f0ee] p-1 hover:bg-[#f1eadf] active:bg-[#e6e1d9] transition-all cursor-pointer"
                  onClick={() => setToken(USDC[ChainId.ARBITRUM_ONE])}
                />
                <Image
                  src="/media/usdt.png"
                  width={32}
                  height={32}
                  alt="usdt"
                  className="w-8 h-8 rounded-full bg-[#f3f0ee] p-1 hover:bg-[#f1eadf] active:bg-[#e6e1d9] transition-all cursor-pointer"
                  onClick={() => setToken(USDT[ChainId.ARBITRUM_ONE])}
                />
              </div>
            ) : null}
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex border border-[#e2cdae] h-10 sm:h-12 px-4 rounded-2xl items-center font-semibold text-[#31291e] hover:bg-[#dfcaaa]/60 transition-all cursor-pointer"
            >
              {token ? (
                <>
                  <img
                    src={token?.icon ?? DEFAULT_IMAGE_URL}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full mr-2"
                    alt=""
                  />
                  {token?.symbol}
                </>
              ) : (
                "Select Token"
              )}
              <ChevronDown className="ml-2 w-4 h-4" />
            </div>
          </div>
        </div>
        {amount && price ? (
          <p className="text-[#afa392] text-sm mt-1">
            ~${Number(price).toFixed(2)}
          </p>
        ) : null}
      </div>
      <TokenListModal
        primaryTokens={primaryTokens}
        currentToken={token}
        setToken={setToken}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SwapSide;
