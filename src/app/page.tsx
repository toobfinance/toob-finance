"use client";

import CCPanel from "@/components/CC/CCPanel";
import SettingPopup from "@/components/SettingPopup";
import SwapPanel from "@/components/Swap/SwapPanel";
import useNetwork from "@/hooks/useNetwork";
import { ChainId } from "@/packages/chain";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { chainId } = useAccount();
  const { offWalletChainId, setOffWalletChainId } = useNetwork();
  const [selectedTab, setSelectedTab] = useState(1);

  let buyDisabled =
    chainId === ChainId.ARBITRUM_ONE
      ? false
      : chainId === ChainId.SANKO_MAINNET
      ? true
      : undefined;
  if (buyDisabled == undefined) {
    buyDisabled = offWalletChainId === ChainId.ARBITRUM_ONE ? false : true;
  }

  useEffect(() => {
    if (buyDisabled) {
      setSelectedTab(0);
    } else {
      setSelectedTab(1);
    }
  }, [buyDisabled]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-[650px] lg:w-[50%] md:pt-20 pt-10 w-[90%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              data-active={selectedTab === 1 && !buyDisabled}
              className={`bg-transparent border border-black/30 dark:border-white/20 rounded-full text-black dark:text-white py-3 px-4 data-[active=true]:bg-black dark:data-[active=true]:bg-white data-[active=true]:text-white dark:data-[active=true]:text-black font-semibold ${
                buyDisabled ? "opacity-50" : ""
              }`}
              disabled={buyDisabled}
              onClick={() => setSelectedTab(1)}
            >
              Buy
            </button>
            <button
              data-active={selectedTab === 0}
              className="bg-transparent border border-black/30 dark:border-white/20 rounded-full text-black dark:text-white py-3 px-4 data-[active=true]:bg-black dark:data-[active=true]:bg-white data-[active=true]:text-white dark:data-[active=true]:text-black font-semibold"
              onClick={() => setSelectedTab(0)}
            >
              Swap
            </button>
            <button
              data-active={selectedTab === 2}
              className="bg-transparent border border-black/30 dark:border-white/20 rounded-full text-black dark:text-white py-3 px-4 data-[active=true]:bg-black dark:data-[active=true]:bg-white data-[active=true]:text-white dark:data-[active=true]:text-black font-semibold opacity-50"
              onClick={() => setSelectedTab(2)}
              disabled={true}
            >
              Limit Order
            </button>
          </div>
          <SettingPopup hideDeadline={selectedTab === 1} />
        </div>
        {selectedTab === 0 ? (
          <SwapPanel />
        ) : selectedTab === 1 ? (
          <CCPanel />
        ) : null}
      </div>
    </div>
  );
}
