"use client";

import { DEFAULT_IMAGE_URL } from "@/constants";
import { ChainId } from "@/packages/chain";
import { Token, Type } from "@/packages/currency";
import { usePrice } from "@/packages/prices";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import TokenImportWarningModal from "./TokenImportWarningModal";
import { useState } from "react";

interface TokenListItemProps {
  token: Type;
  onSelectItem: any;
  className?: string;
}

const TokenListItem: React.FC<TokenListItemProps> = ({
  token,
  onSelectItem,
  className,
}) => {
  const { address, chainId } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: token instanceof Token ? token.address : undefined,
    query: { enabled: Boolean(address), refetchInterval: 30000 },
  });
  const [warningOpen, setWarningOpen] = useState(false);

  const connectedChainId =
    chainId === ChainId.ARBITRUM_ONE
      ? ChainId.ARBITRUM_ONE
      : chainId === ChainId.SANKO_MAINNET
      ? ChainId.SANKO_MAINNET
      : undefined;

  const { data: price } = usePrice({
    address: token.wrapped.address,
    chainId: connectedChainId,
    enabled: (balance?.value ?? 0n) > 0n && connectedChainId != undefined,
  });

  return (
    <>
      <div
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/15 transition-all cursor-pointer ${
          className ?? ""
        }`}
        onClick={
          token.isCustom ? () => setWarningOpen(true) : onSelectItem(token)
        }
      >
        <div className="flex items-center">
          <Image
            src={token?.icon ?? DEFAULT_IMAGE_URL}
            width={32}
            height={32}
            alt="token"
            className={`h-8 w-8 rounded-full ${
              token.icon ? "" : "invert dark:invert-0"
            }`}
          />
          <div className="ml-4">
            <div className="flex items-center">
              <span className="text-black dark:text-white font-semibold">
                {token.name}
              </span>
              <span className="text-black dark:text-white text-sm ml-2">
                {token.symbol}
              </span>
            </div>
            <div className="text-sm text-black/50 dark:text-white/60">
              {token.category}
            </div>
          </div>
        </div>
        {balance && balance.value > 0n ? (
          <div className="flex flex-col items-end">
            <span className="text-black dark:text-white text-sm font-semibold">
              {Number(balance.formatted).toLocaleString("en-US", {
                maximumFractionDigits: 9,
              })}
            </span>
            {price ? (
              <span className="text-black/50 dark:text-white/60 text-sm">
                ${(price * Number(balance.formatted)).toFixed(2)}
              </span>
            ) : undefined}
          </div>
        ) : null}
      </div>

      {token.isCustom ? (
        <TokenImportWarningModal
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
          onConfirm={onSelectItem(token)}
          token={token.wrapped.address}
        />
      ) : null}
    </>
  );
};

export default TokenListItem;
