"use client"

import { useEffect, useRef, useState } from "react"
import ChevronDown from "../svgs/ChevronDown"
import TokenListModal from "../TokenListModal"
import { ARB, Amount, Token, Type, USDC, USDT } from "@/packages/currency"
import { DEFAULT_IMAGE_URL, NATIVE_GAS_FEE } from "@/constants"
import Image from "next/image"
import { useAccount, useBalance } from "wagmi"
import { ChainId } from "@/packages/chain"

interface SwapSideProps {
  side: "From" | "To"
  amount: string | undefined
  setAmount?: any
  token?: Type
  setToken: any
  className?: string
  hideSide?: boolean
  hideBalance?: boolean
  disabled?: boolean
  price?: string
  primaryTokens?: boolean
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
  const { address } = useAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const tokenSelectorRef = useRef<HTMLDivElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)

  const fastTokens = !token

  const { data: balance } = useBalance({
    address,
    token: token instanceof Token ? token.address : undefined,
    query: {
      enabled: Boolean(address) && Boolean(token),
      refetchInterval: 30000,
    },
  })

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
        )
      } else setAmount?.(Amount.fromRawAmount(token, balance.value).toExact())
    } else {
      setAmount?.("0")
    }
  }

  const onAmountInput = (e: string) => {
    if (
      e === "" ||
      RegExp(`^\\d*(?:\\\\[.])?\\d*$`).test(
        e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      )
    ) {
      setAmount(e)
    }
  }

  useEffect(() => {
    if (amountInputRef.current)
      amountInputRef.current.style.paddingRight = `${
        (tokenSelectorRef.current?.clientWidth ?? 0) + 10
      }px`
  }, [token, balance])

  return (
    <>
      <div className={className ?? ""}>
        <div className="flex items-start justify-between">
          {!hideSide && (
            <h2 className="text-black/60 dark:text-white/70 font-semibold">
              {side}
            </h2>
          )}
          {!hideBalance && balance && token ? (
            <button
              className="text-xs text-black dark:text-white px-2 h-6 font-semibold rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
              disabled={side === "To"}
              onClick={onMax}
            >
              <span className="mr-1">Balance:</span>
              {Number(balance.formatted).toLocaleString("en-US", {
                maximumFractionDigits: 9,
              })}
            </button>
          ) : null}
        </div>
        <div className="relative mt-1">
          {side === "To" ? (
            <div className="text-black/50 dark:text-white/60 absolute top-0 bottom-0 left-0 text-[30px]">
              ~
            </div>
          ) : null}
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            pattern="^[0-9]*[.,]?[0-9]*$"
            onChange={(e) => onAmountInput(e.target.value)}
            disabled={disabled}
            ref={amountInputRef}
            data-fast={fastTokens}
            data-left={side === "To"}
            className="w-full h-12 max-sm:data-[fast=true]:h-[72px] outline-none text-[30px] bg-transparent text-black dark:text-white font-semibold placeholder:text-black/60 dark:placeholder:text-white/70 data-[left=true]:pl-5"
            placeholder="0.0"
          />
          <div
            ref={tokenSelectorRef}
            data-fast={fastTokens}
            className="flex max-sm:data-[fast=true]:flex-col max-sm:data-[fast=true]:items-end absolute max-sm:justify-center bottom-0 right-0 min-h-full items-center space-x-2 max-sm:data-[fast=true]:space-x-0"
          >
            {balance && side === "From" ? (
              <button
                className="text-black dark:text-white text-xs font-semibold border border-black dark:border-white rounded-full h-6 px-2 py-1 hover:brightness-90 transition-all"
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
                  className="w-8 h-8 rounded-full bg-black/20 dark:bg-white/40 p-1 hover:bg-black/30 dark:hover:bg-white/60 active:bg-black/50 dark:active:bg-white/70 transition-all cursor-pointer"
                  onClick={() => setToken(ARB[ChainId.ARBITRUM_ONE])}
                />
                <Image
                  src="/media/usdc.png"
                  width={32}
                  height={32}
                  alt="usdc"
                  className="w-8 h-8 rounded-full bg-black/20 dark:bg-white/40 p-1 hover:bg-black/30 dark:hover:bg-white/60 active:bg-black/50 dark:active:bg-white/70 transition-all cursor-pointer"
                  onClick={() => setToken(USDC[ChainId.ARBITRUM_ONE])}
                />
                <Image
                  src="/media/usdt.png"
                  width={32}
                  height={32}
                  alt="usdt"
                  className="w-8 h-8 rounded-full bg-black/20 dark:bg-white/40 p-1 hover:bg-black/30 dark:hover:bg-white/60 active:bg-black/50 dark:active:bg-white/70 transition-all cursor-pointer"
                  onClick={() => setToken(USDT[ChainId.ARBITRUM_ONE])}
                />
              </div>
            ) : null}
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex border border-black dark:border-white h-10 sm:h-12 px-4 rounded-2xl items-center font-semibold bg-black dark:bg-white hover:brightness-90 transition-all text-white dark:text-black cursor-pointer"
            >
              {token ? (
                <>
                  <img
                    src={token?.icon ?? DEFAULT_IMAGE_URL}
                    width={20}
                    height={20}
                    className={`h-5 w-5 rounded-full mr-2 ${
                      token.icon ? "" : "invert-0 dark:invert"
                    }`}
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
          <p className="text-black/60 dark:text-white/50 text-sm mt-1">
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
  )
}

export default SwapSide
