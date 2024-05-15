"use client"

import WalletConnect from "../WalletConnect"
import NetworkSelector from "../NetworkSelector"

const Header = () => {
  return (
    <header className="py-4">
      <div className="px-4 flex items-center w-full justify-end">
        <div className="flex items-center">
          <NetworkSelector className="mr-4" />
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}

export default Header
