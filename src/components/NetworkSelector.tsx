"use client";

import Image from "next/image";
import Arb from "@/assets/arb.png";
import Sanko from "@/assets/sanko.png";
import Sanko_Dark from "@/assets/sanko_dark.png";
import { useAccount, useSwitchChain } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import ChevronDown from "./svgs/ChevronDown";

interface NetworkSelectorProps {
  className?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ className }) => {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { open } = useWeb3Modal();

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    handleThemeChange();

    const observer = new MutationObserver(() => {
      handleThemeChange();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const onSwitchChain = () => {
    if (chainId !== 42161 && chainId !== 1996) {
      switchChainAsync?.({ chainId: 42161 }); // Default to Arbitrum One for switching
    } else {
      open?.({
        view: "Networks",
      });
    }
  };

  const sankoLogoSrc = isHovered
    ? isDarkMode
      ? Sanko_Dark.src
      : Sanko.src
    : isDarkMode
    ? Sanko.src
    : Sanko_Dark.src;

  return (
    <button
      data-wrong={address && chainId !== 42161 && chainId !== 1996}
      className={`flex items-center bg-transparent border rounded-xl border-black dark:border-white data-[wrong=true]:border-[#ff9b9b] px-4 py-3 outline-none hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black transition-all ${
        className ?? ""
      }`}
      onClick={onSwitchChain}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            src={sankoLogoSrc}
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
        src={chainId === 1996 ? sankoLogoSrc : Arb.src}
        width={chainId === 1996 ? Sanko.width : Arb.width}
        height={chainId === 1996 ? Sanko.blurHeight : Arb.blurHeight}
        alt={chainId === 1996 ? "sanko" : "arbitrum"}
        className="w-5 h-5 sm:hidden"
      />
      <ChevronDown
        className={`w-5 h-5 ml-1 transition-colors duration-300 ${
          isHovered
            ? "text-white dark:text-black"
            : "text-black dark:text-white"
        }`}
      />
    </button>
  );
};

export default NetworkSelector;
