"use client"

import { useWeb3Modal } from "@web3modal/wagmi/react"
import {
  useAccount,
  useBalance,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi"
import useSwapParams from "../../hooks/useSwapParams"
import { Amount, Token, tryParseAmount } from "@/packages/currency"
import Spinner from "../Spinner"
import React, { useState } from "react"
import { ApprovalState, useTokenApproval } from "@/hooks/useTokenApproval"
import { ChainId } from "@/packages/chain"
import { UseQueryResult } from "@tanstack/react-query"
import useSettings from "@/hooks/useSettings"
import { AGGREGATOR_ADDR } from "@/contracts"
import { getKyberTxData, getOdosTxData, getXFusionTxData } from "@/utils/trade"
import AggregatorABI from "@/contracts/AggregatorABI"
import toast from "react-hot-toast"
import CustomToast from "../CustomToast"
import { erc20Abi } from "viem"

interface SwapButtonProps {
  trade: UseQueryResult<any, Error>
}

const SwapButton: React.FC<SwapButtonProps> = ({ trade }) => {
  const { address, chainId } = useAccount()
  const { open } = useWeb3Modal()
  const { amountIn, tokenIn, tokenOut, setAmountIn } = useSwapParams()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { switchChainAsync } = useSwitchChain()
  const [loading, setLoading] = useState(false)

  const parsedAmount = tryParseAmount(amountIn, tokenIn)

  const [approvalState, approve, approvalRequest] = useTokenApproval({
    amount: parsedAmount,
    spender: AGGREGATOR_ADDR,
    enabled: Boolean(parsedAmount),
  })

  const onSwap = async () => {
    if (!address || !publicClient || !walletClient) {
      open?.()
    } else if (chainId !== ChainId.ARBITRUM_ONE) {
      switchChainAsync?.({ chainId: ChainId.ARBITRUM_ONE })
    } else {
      try {
        if (!tokenIn || !tokenOut) return
        await trade.refetch()

        if (!trade.data || !trade.data.length) return

        const swapTrade = { ...trade.data[0] }

        console.log(swapTrade)

        setLoading(true)

        const txData = await (swapTrade.type === "Odos"
          ? getOdosTxData(swapTrade)
          : swapTrade.type === "KyberSwap"
          ? getKyberTxData(swapTrade)
          : getXFusionTxData(swapTrade))

        console.log(txData)

        const balanceBefore = tokenOut.isNative
          ? await publicClient.getBalance({ address })
          : await publicClient.readContract({
              abi: erc20Abi,
              address: tokenOut.address,
              functionName: "balanceOf",
              args: [address],
            })

        const { request } = await publicClient.simulateContract({
          abi: AggregatorABI,
          address: AGGREGATOR_ADDR,
          account: address,
          functionName: "swap",
          args: [txData.args as any],
          value: txData.value,
        })

        const hash = await walletClient.writeContract(request)

        const res = await publicClient.waitForTransactionReceipt({ hash })

        const balanceAfter = tokenOut.isNative
          ? await publicClient.getBalance({ address })
          : await publicClient.readContract({
              abi: erc20Abi,
              address: tokenOut.address,
              functionName: "balanceOf",
              args: [address],
            })

        toast.custom((t) => (
          <CustomToast
            t={t}
            type="success"
            text={`Swap ${Amount.fromRawAmount(
              tokenIn,
              txData.amountIn
            ).toSignificant(6)} ${
              swapTrade.tokenIn.symbol
            } for ${Amount.fromRawAmount(
              tokenOut,
              balanceAfter - balanceBefore
            ).toSignificant(6)} ${swapTrade.tokenOut.symbol}`}
            hash={hash}
          />
        ))

        setAmountIn("")

        console.log(res)
      } catch (err: any) {
        console.log(err)
        if (!err?.message?.includes("User rejected the request.")) {
          toast.custom((t) => (
            <CustomToast
              t={t}
              type="error"
              text={
                err?.shortMessage ??
                `Failed to send the transaction. Please check the slippage and try again later.`
              }
            />
          ))
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const onApprove = () => {
    try {
      approve(approvalRequest)
    } catch (err) {
      console.log(err)
    }
  }

  const { data: balance } = useBalance({
    address,
    token: tokenIn instanceof Token ? tokenIn.address : undefined,
    query: {
      enabled: Boolean(address) && Boolean(tokenIn),
      refetchInterval: 30000,
    },
  })

  const fetching =
    Boolean(tokenIn) &&
    Boolean(tokenOut) &&
    Boolean(parsedAmount?.greaterThan(0n)) &&
    (trade.isFetching || trade.isLoading || trade.isPending)
  const wrongNetworkError = chainId !== ChainId.ARBITRUM_ONE
  const nonAssetError = !tokenIn || !tokenOut
  const nonAmountError = !(
    tokenIn &&
    amountIn &&
    tryParseAmount(amountIn, tokenIn)?.greaterThan(0n)
  )
  const insufficientBalanceError =
    Number(amountIn) > Number(balance?.formatted ?? "0")

  const isError = nonAmountError || nonAssetError || insufficientBalanceError

  return (
    <div className="mt-4">
      {!fetching &&
      !isError &&
      trade.data &&
      (approvalState === ApprovalState.NOT_APPROVED ||
        approvalState === ApprovalState.PENDING) ? (
        <button
          className="flex items-center justify-center h-12 w-full bg-[#d8c7ad] text-[#1F1D1A] border-b-2 border-[#d1bc9c] enabled:hover:bg-[#d1bc9c] enabled:hover:border-[#c0ac8e] transition-all rounded-full mt-8 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={onApprove}
          disabled={approvalState === ApprovalState.PENDING}
        >
          <>
            {approvalState === ApprovalState.PENDING ? (
              <Spinner className="w-5 h-5 mr-2" />
            ) : null}
            Approve {tokenIn?.symbol}
          </>
        </button>
      ) : null}
      <button
        className="flex items-center justify-center h-12 w-full bg-[#d8c7ad] text-[#1F1D1A] border-b-2 border-[#d1bc9c] enabled:hover:bg-[#d1bc9c] enabled:hover:border-[#c0ac8e] transition-all rounded-full font-semibold disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        onClick={onSwap}
        disabled={
          (address &&
            !wrongNetworkError &&
            (isError || !(approvalState === ApprovalState.APPROVED))) ||
          fetching ||
          loading
        }
      >
        {fetching ? (
          <>
            <Spinner className="w-5 h-5 mr-2" />
            Fetching Best Trade
          </>
        ) : loading ? (
          <>
            <Spinner className="w-5 h-5 mr-2" />
            Waiting for Confirmation
          </>
        ) : !address ? (
          "Connect Wallet"
        ) : wrongNetworkError ? (
          "Switch Network"
        ) : nonAssetError ? (
          "Select Asset to Trade"
        ) : nonAmountError ? (
          "Input Amount to Trade"
        ) : insufficientBalanceError ? (
          `Insufficient ${tokenIn?.symbol} Balance`
        ) : (
          "Swap"
        )}
      </button>
    </div>
  )
}

export default SwapButton
