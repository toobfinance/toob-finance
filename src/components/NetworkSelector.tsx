"use client";

import Image from "next/image";
import Arb from "@/assets/arb.png";
import Sanko from "@/assets/sanko.svg";
import { useAccount, useSwitchChain } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useRef, useState } from "react";
import ChevronDown from "./svgs/ChevronDown";
import useNetwork from "@/hooks/useNetwork";
import SankoIcon from "./svgs/SankoIcon";

interface NetworkSelectorProps {
  className?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ className }) => {
  const { address, chainId } = useAccount();
  const { offWalletChainId, setOffWalletChainId } = useNetwork();
  const { switchChainAsync } = useSwitchChain();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { open } = useWeb3Modal();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const onSwitchChain = async (selectedChainId?: number) => {
    console.log("Switching to chain:", selectedChainId);
    if (address) {
      // Wallet connected
      if (chainId !== selectedChainId && selectedChainId) {
        try {
          await switchChainAsync?.({ chainId: selectedChainId });
        } catch (error) {
          console.error("Failed to switch chain", error);
        }
      } else {
        open?.({
          view: "Networks",
        });
      }
    } else {
      // Wallet not connected, use offWalletChainId
      setOffWalletChainId(selectedChainId);
    }
    setIsDropdownOpen(false);
  };

  const currentChainId = address ? chainId : offWalletChainId;

  const networkOptions = [
    { id: 42161, name: "Arbitrum", icon: Arb },
    { id: 1996, name: "Sanko Mainnet", icon: Sanko },
  ];

  return (
    <div className="relative flex flex-col items-center mr-3" ref={dropdownRef}>
      <button
        className={`flex items-center bg-transparent border rounded-xl border-black dark:border-white px-4 py-3 outline-none hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black transition-all ${
          className ?? ""
        }`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {networkOptions.map((network) =>
          network.id === currentChainId ? (
            <div key={network.id} className="flex items-center">
              {network.id === 42161 ? (
                <Image
                  src={network.icon.src}
                  width={network.icon.width}
                  height={network.icon.blurHeight}
                  alt={network.name.toLowerCase()}
                  className="w-5 h-5"
                />
              ) : (
                <SankoIcon className="w-5 h-5" />
              )}

              <span className="font-semibold ml-2 min-w-[110px] max-sm:hidden">
                {network.name}
              </span>
            </div>
          ) : null
        )}
        <ChevronDown className="w-5 h-5 ml-1" />
      </button>
      {isDropdownOpen && (
        <div className="absolute w-full bg-white dark:bg-black border rounded-xl border-black dark:border-white mt-[55px] z-[10]">
          {networkOptions.map((network) => (
            <button
              key={network.id}
              className={`w-full flex items-center rounded-xl hover:bg-black 
                dark:hover:bg-white px-4 py-3 text-black dark:text-white hover:text-white dark:hover:text-black transition-all ${
                  className ?? ""
                }`}
              onClick={() => onSwitchChain(network.id)}
            >
              <span
                className={`font-semibold mr-2 ${
                  currentChainId === network.id ? "" : "opacity-0"
                }`}
              >
                ✓
              </span>
              {network.id === 42161 ? (
                <Image
                  src={network.icon.src}
                  width={network.icon.width}
                  height={network.icon.blurHeight}
                  alt={network.name.toLowerCase()}
                  className="w-5 h-5"
                />
              ) : (
                <SankoIcon className="w-5 h-5" />
              )}
              <span className="font-semibold ml-2 max-sm:hidden">{network.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
