"use client"

import Image from "next/image"
import USD from "@/assets/usd.svg"

interface CCFiatSideProps {
  amount: string | undefined
  setAmount?: any
  className?: string
}

const CCFiatSide: React.FC<CCFiatSideProps> = ({
  amount,
  setAmount,
  className,
}) => {
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

  return (
    <div className={`relative mt-1 ${className ?? ""}`}>
      <div className="flex items-start justify-between">
        <h2 className="text-black/60 dark:text-white/70 font-semibold">From</h2>
      </div>
      <div className="relative mt-1">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          pattern="^[0-9]*[.,]?[0-9]*$"
          onChange={(e) => onAmountInput(e.target.value)}
          className="w-full h-12 max-sm:data-[fast=true]:h-[72px] outline-none text-[30px] pr-28 bg-transparent text-black dark:text-white font-semibold placeholder:text-black/60 dark:placeholder:text-white/70"
          placeholder="0.0"
        />
        <div
          className="absolute flex items-center space-x-2 top-1/2
       -translate-y-1/2 right-0 border border-black dark:border-white bg-blend-darken bg-black dark:bg-white text-white dark:text-black h-10 sm:h-12 px-4 rounded-2xl hover:brightness-90 transition-all cursor-pointer"
        >
          <Image
            src={USD.src}
            width={USD.width}
            height={USD.height}
            alt="usd"
            className="w-5"
          />
          <span className="font-semibold">USD</span>
        </div>
      </div>
    </div>
  )
}

export default CCFiatSide
