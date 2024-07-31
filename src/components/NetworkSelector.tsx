"use client";

import Image from "next/image";
import Arb from "@/assets/arb.png";
import Sanko from "@/assets/sanko.png"; // Import the Sanko Mainnet logo
import { useAccount, useSwitchChain } from "wagmi";

interface NetworkSelectorProps {
  className?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ className }) => {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const onSwitchChain = () => {
    if (chainId !== 42161 && chainId !== 1996) {
      switchChainAsync?.({ chainId: 1996 }); // Default to Sanko Mainnet for switching
    }
  };

  return (
    <button
      data-wrong={address && chainId !== 42161 && chainId !== 1996}
      className={`flex items-center bg-transparent border rounded-xl border-black dark:border-white data-[wrong=true]:border-[#ff9b9b] px-4 py-3 outline-none hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black transition-all ${
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
      ) : chainId === 1996 ? (
        <div className="flex items-center max-sm:hidden">
          <Image
            src={Sanko.src}
            width={Sanko.width}
            height={Sanko.blurHeight}
            alt="sanko"
            className="w-5 h-5"
          />
          <span className="font-semibold ml-2">Sanko Mainnet</span>
        </div>
      ) : (
        <span className="text-[#ff5b5b] font-semibold max-sm:hidden">
          Wrong Network
        </span>
      )}
      <Image
        src={chainId === 1996 ? Sanko.src : Arb.src}
        width={chainId === 1996 ? Sanko.width : Arb.width}
        height={chainId === 1996 ? Sanko.blurHeight : Arb.blurHeight}
        alt={chainId === 1996 ? "sanko" : "arbitrum"}
        className="w-5 h-5 sm:hidden"
      />
    </button>
  );
};

export default NetworkSelector;
