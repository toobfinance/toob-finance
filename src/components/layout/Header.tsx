"use client"

import WalletConnect from "../WalletConnect"
import NetworkSelector from "../NetworkSelector"
import ThemeSwitcher from "../ThemeSwitcher"

const Header = () => {
  return (
    <header className="py-4">
      <div className="px-4 flex items-center w-full justify-end">
        <div className="flex items-center">
          <ThemeSwitcher className="mr-3" />
          <NetworkSelector />
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}

export default Header
