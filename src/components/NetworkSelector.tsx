"use client"

import Image from "next/image"
import Arb from "@/assets/arb.png"
import { useAccount, useSwitchChain } from "wagmi"

interface NetworkSelectorProps {
  className?: string
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ className }) => {
  const { address, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const onSwitchChain = () => {
    if (chainId !== 42161) {
      switchChainAsync?.({ chainId: 42161 })
    }
  }

  return (
    <button
      data-wrong={address && chainId !== 42161}
      className={`flex items-center bg-transparent border rounded-xl border-white data-[wrong=true]:border-[#ff9b9b] px-4 py-3 outline-none hover:bg-white text-white hover:text-black transition-all ${
        className ?? ""
      }`}
      onClick={onSwitchChain}
    >
      {!address || chainId === 42161 ? (
        <div className="flex items-center max-sm:hidden">
          <Image
            src={Arb.src}
            width={Arb.width}
            height={Arb.blurHeight}
            alt="arbitrum"
            className="w-5 h-5"
          />
          <span className="font-semibold ml-2">Arbitrum</span>
        </div>
      ) : (
        <span className="text-[#ff5b5b] font-semibold max-sm:hidden">
          Wrong Network
        </span>
      )}
      <Image
        src={Arb.src}
        width={Arb.width}
        height={Arb.blurHeight}
        alt="arbitrum"
        className="w-5 h-5 sm:hidden"
      />
    </button>
  )
}

export default NetworkSelector
