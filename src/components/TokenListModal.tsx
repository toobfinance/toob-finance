"use client";

import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import Close from "./svgs/Close";
import Magnifier from "./svgs/Magnifier";
import TokenListItem from "./TokenListItem";
import { useTokenList, useSankoTokenList } from "../hooks/useTokenList";
import { Token, Type } from "@/packages/currency";
import { useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { Address, erc20Abi, getAddress, isAddress } from "viem";
import { ChainId } from "@/packages/chain";
import { SANKO_TOKEN_LIST, TOKEN_LIST } from "@/packages/config";
import HelpToolTip from "./HelpToolTip";
import Link from "next/link";

interface TokenListModalProps {
  currentToken?: Type;
  setToken: any;
  open: boolean;
  onClose: any;
  primaryTokens?: boolean;
}

const TokenListModal: React.FC<TokenListModalProps> = ({
  currentToken,
  setToken,
  open,
  onClose,
  primaryTokens,
}) => {
  const { chainId } = useAccount();
  const [filter, setFilter] = useState("");

  const tokenList = useTokenList(primaryTokens);
  const sankoTokenList = useSankoTokenList(primaryTokens);

  const isSanko: boolean = chainId === ChainId.SANKO_MAINNET;
  const activeTokenList = isSanko ? sankoTokenList : tokenList;

  const { data: tokenInfo } = useReadContracts({
    contracts: [
      { abi: erc20Abi, address: filter as Address, functionName: "name" },
      { abi: erc20Abi, address: filter as Address, functionName: "symbol" },
      { abi: erc20Abi, address: filter as Address, functionName: "decimals" },
    ],
    query: {
      enabled: isAddress(filter),
    },
  });

  const onSelectItem = (token: Type) => {
    return () => {
      setToken(token);
      onClose();
    };
  };

  const tokens = [
    ...activeTokenList.filter((item) =>
      item.name?.match(
        new RegExp(filter, "i") || item.symbol?.match(new RegExp(filter, "i"))
      )
    ),
    ...(isAddress(filter) && tokenInfo
      ? [
          new Token({
            address: getAddress(filter),
            chainId: isSanko ? ChainId.SANKO_MAINNET : ChainId.ARBITRUM_ONE,
            name: tokenInfo[0]?.result,
            symbol: tokenInfo[1]?.result,
            decimals: tokenInfo[2]?.result ?? 18,
            isCustom: true,
          }),
        ]
      : []),
    ...(filter.length >= 3
      ? isSanko
        ? [] // For Sanko, no tokens yet, so empty array for now
        : // SANKO_TOKEN_LIST.filter((item) =>
          //   item.name?.match(
          //     new RegExp(filter, "i") ||
          //       item.symbol?.match(new RegExp(filter, "i"))
          //   )
          // ).map(
          //   (item) =>
          //     new Token({
          //       address: item.address,
          //       name: item.name,
          //       symbol: item.symbol,
          //       chainId: isSanko ? ChainId.SANKO_MAINNET : ChainId.ARBITRUM_ONE,
          //       decimals: item.decimals,
          //       icon: item.icon,
          //     })
          // )
          TOKEN_LIST.filter((item) =>
            item.name?.match(
              new RegExp(filter, "i") ||
                item.symbol?.match(new RegExp(filter, "i"))
            )
          ).map(
            (item) =>
              new Token({
                address: item.address,
                name: item.name,
                symbol: item.symbol,
                chainId: isSanko ? ChainId.SANKO_MAINNET : ChainId.ARBITRUM_ONE,
                decimals: item.decimals,
                icon: item.icon,
              })
          )
      : []),
  ];

  return (
    <>
      <Transition appear show={open}>
        <Dialog
          as="div"
          className="relative z-10 focus:outline-none"
          onClose={onClose}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center">
              <DialogPanel className="relative w-full max-w-md border border-white/20 bg-white dark:bg-transparent dark:bg-[linear-gradient(180deg,#000000_52%,#1e1e1e_100%)] rounded-2xl backdrop-blur-2xl overflow-hidden">
                <h3 className="px-6 py-4 text-xl font-semibold text-black dark:text-white">
                  Select a token
                </h3>
                <button
                  className="flex items-center justify-center absolute w-10 h-10 top-2 right-3"
                  onClick={onClose}
                >
                  <Close className="w-3 h-3 text-black dark:text-white" />
                </button>
                <div className="relative mx-4">
                  <div className="absolute flex items-center justify-center min-w-12 w-12 h-12">
                    <Magnifier className="w-4 h-4 text-black" />
                  </div>
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search tokens by contract address or name"
                    className="w-full h-12 text-lg outline-none bg-transparent text-black border border-black/30 dark:border-white/20 rounded-xl transition-all bg-white focus:shadow-[#fff7_0px_0px_0px_2px] pl-10 pr-4 placeholder:text-black/50"
                  />
                </div>
                <div className="flex items-center mx-4 text-xs text-black dark:text-white my-2 font-medium">
                  <span>List Your Token</span>
                  <HelpToolTip className="ml-1">
                    <div className="whitespace-nowrap text-black">
                      Please contact:
                    </div>
                    <Link
                      href={"mailto:team@toob.finance"}
                      className="underline text-[#6666f1]"
                    >
                      team@toob.finance
                    </Link>
                  </HelpToolTip>
                </div>
                <div className="flex flex-col border-t border-black/30 dark:border-white/20 rounded-es-2xl rounded-ee-2xl p-4 space-y-2 h-[66vh] overflow-y-auto">
                  {tokens
                    .sort((a, b) =>
                      (a.symbol ?? "") > (b.symbol ?? "") ? 1 : -1
                    )
                    .map((item) => (
                      <TokenListItem
                        key={item.id}
                        token={item}
                        onSelectItem={onSelectItem}
                      />
                    ))}
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default TokenListModal;
