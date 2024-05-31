"use client";

import CCPanel from "@/components/CC/CCPanel";
import SettingPopup from "@/components/SettingPopup";
import SwapPanel from "@/components/Swap/SwapPanel";
import { useState } from "react";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState(1);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-[650px] lg:w-[50%] md:pt-20 pt-10 w-[90%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              data-active={selectedTab === 1}
              className="bg-transparent border border-[#e2cdae] rounded-full text-[#afa392] data-[active=true]:text-[#1f1d1a] py-3 px-4 data-[active=true]:bg-[#e4e4e4] font-semibold"
              onClick={() => setSelectedTab(1)}
            >
              Buy
            </button>
            <button
              data-active={selectedTab === 0}
              className="bg-transparent border border-[#e2cdae] rounded-full text-[#1f1d1a] py-3 px-4 data-[active=true]:bg-[#e4e4e4] font-semibold"
              onClick={() => setSelectedTab(0)}
            >
              Swap
            </button>
            <button
              data-active={selectedTab === 2}
              className="bg-transparent border border-[#e2cdae] rounded-full text-[#afa392] data-[active=true]:text-[#1f1d1a] py-3 px-4 data-[active=true]:bg-[#e4e4e4] font-semibold"
              // onClick={() => setSelectedTab(2)}
            >
              Limit Order
            </button>
          </div>
          {selectedTab === 0 ? <SettingPopup /> : null}
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
