"use client"

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import Close from "./svgs/Close"
import Magnifier from "./svgs/Magnifier"
import TokenListItem from "./TokenListItem"
import useTokenList from "../hooks/useTokenList"
import { Token, Type } from "@/packages/currency"
import { useState } from "react"
import { useReadContracts } from "wagmi"
import { Address, erc20Abi, getAddress, isAddress } from "viem"
import { ChainId } from "@/packages/chain"
import { TOKEN_LIST } from "@/packages/config"

interface TokenListModalProps {
  currentToken?: Type
  setToken: any
  open: boolean
  onClose: any
}

const TokenListModal: React.FC<TokenListModalProps> = ({
  currentToken,
  setToken,
  open,
  onClose,
}) => {
  const tokenList = useTokenList()
  const [filter, setFilter] = useState("")

  const { data: tokenInfo } = useReadContracts({
    contracts: [
      { abi: erc20Abi, address: filter as Address, functionName: "name" },
      { abi: erc20Abi, address: filter as Address, functionName: "symbol" },
      { abi: erc20Abi, address: filter as Address, functionName: "decimals" },
    ],
    query: {
      enabled: isAddress(filter),
    },
  })

  const onSelectItem = (token: Type) => {
    return () => {
      setToken(token)
      onClose()
    }
  }

  return (
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
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="relative w-full max-w-md bg-[#e9e1d4] rounded-2xl backdrop-blur-2xl overflow-hidden">
                <h3 className="px-6 py-4 text-xl font-semibold text-[#1A202B]">
                  Select a token
                </h3>
                <button
                  className="flex items-center justify-center absolute w-10 h-10 top-2 right-3"
                  onClick={onClose}
                >
                  <Close className="w-3 h-3 text-[#1f1d1a]" />
                </button>
                <div className="relative mx-4 mb-4">
                  <div className="absolute flex items-center justify-center min-w-12 w-12 h-12">
                    <Magnifier className="w-4 h-4 text-[#1f1d1a]" />
                  </div>
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search by name, symbol or address"
                    className="w-full h-12 text-lg outline-none bg-transparent text-[#1A202B] border border-[#b19f85] hover:border-[#CBD5E0] rounded-xl transition-all bg-white focus:border-[#e9bd7a] focus:shadow-[#e9bd7a_0px_0px_0px_1px] pl-10 pr-4"
                  />
                </div>
                <div className="flex flex-col bg-[#f3f3f3] rounded-es-2xl rounded-ee-2xl p-4 space-y-2 h-[66vh] overflow-y-auto">
                  {tokenList
                    .filter((item) =>
                      item.name?.match(
                        new RegExp(filter, "i") ||
                          item.symbol?.match(new RegExp(filter, "i"))
                      )
                    )
                    .map((item) => (
                      <TokenListItem
                        key={item.id}
                        token={item}
                        onSelectItem={onSelectItem}
                      />
                    ))}
                  {isAddress(filter) && tokenInfo ? (
                    <TokenListItem
                      token={
                        new Token({
                          address: getAddress(filter),
                          chainId: ChainId.ARBITRUM_ONE,
                          name: tokenInfo[0]?.result,
                          symbol: tokenInfo[1]?.result,
                          decimals: tokenInfo[2]?.result ?? 18,
                        })
                      }
                      onSelectItem={onSelectItem}
                    />
                  ) : null}
                  {filter.length >= 3
                    ? TOKEN_LIST.filter((item) =>
                        item.name?.match(
                          new RegExp(filter, "i") ||
                            item.symbol?.match(new RegExp(filter, "i"))
                        )
                      ).map((item) => {
                        const token = new Token({
                          address: item.address,
                          name: item.name,
                          symbol: item.symbol,
                          chainId: ChainId.ARBITRUM_ONE,
                          decimals: item.decimals,
                          icon: item.icon,
                        })

                        return (
                          <TokenListItem
                            key={token.id}
                            token={token}
                            onSelectItem={onSelectItem}
                          />
                        )
                      })
                    : null}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default TokenListModal
