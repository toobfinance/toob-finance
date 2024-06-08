"use client"

import { useWeb3Modal } from "@web3modal/wagmi/react"
import Wallet from "./svgs/Wallet"
import { useAccount } from "wagmi"

const WalletConnect = () => {
  const { address } = useAccount()
  const { open } = useWeb3Modal()
  const onConnect = () => {
    open?.()
  }

  return (
    <button
      className="flex items-center bg-transparent font-semibold hover:bg-black dark:hover:bg-white rounded-xl border border-black dark:border-white text-black dark:text-white hover:text-white dark:hover:text-black px-4 py-3 outline-none transition-all"
      onClick={onConnect}
    >
      <Wallet className="mr-2" />{" "}
      {address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </button>
  )
}

export default WalletConnect
