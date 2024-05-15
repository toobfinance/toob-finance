"use client"

import { useCallback, useMemo, useState } from "react"
// import * as Sentry from '@sentry/nextjs'
import { Amount, Type } from "../packages/currency"
import { UserRejectedRequestError, maxUint256 } from "viem"
import {
  useAccount,
  useWriteContract,
  useSimulateContract,
  usePublicClient,
} from "wagmi"
import { Address } from "viem"
import { SendTransactionReturnType } from "wagmi/actions"

import { useTokenAllowance } from "./useTokenAllowance"
import toast from "react-hot-toast"
import CustomToast from "@/components/CustomToast"

export enum ApprovalState {
  LOADING = "LOADING",
  UNKNOWN = "UNKNOWN",
  NOT_APPROVED = "NOT_APPROVED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

interface UseTokenApprovalParams {
  spender: Address | undefined
  amount: Amount<Type> | undefined
  approveMax?: boolean
  enabled?: boolean
}

export const useTokenApproval = ({
  amount,
  spender,
  enabled = true,
  approveMax,
}: UseTokenApprovalParams): [ApprovalState, any, any] => {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [pending, setPending] = useState(false)
  const {
    data: allowance,
    isLoading: isAllowanceLoading,
    refetch,
  } = useTokenAllowance({
    token: amount?.currency?.wrapped,
    owner: address,
    spender,
    chainId: amount?.currency.chainId,
    enabled: Boolean(amount?.currency?.isToken && enabled),
  })

  const { data } = useSimulateContract({
    chainId: amount?.currency.chainId,
    abi: [
      {
        constant: false,
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const,
    address: amount?.currency?.wrapped?.address as Address,
    functionName: "approve",
    args: [
      spender as Address,
      approveMax ? maxUint256 : amount ? amount.quotient : 0n,
    ],
    query: {
      enabled: Boolean(
        amount &&
          spender &&
          address &&
          allowance &&
          enabled &&
          !isAllowanceLoading
      ),
    },
    // onError: (error) => Sentry.captureException(`approve prepare error: ${error.message}`),
  })

  const onSettled = useCallback(
    (data: SendTransactionReturnType | undefined, e: Error | null) => {
      if (data && amount) {
        setPending(true)
      }
    },
    [address, amount]
  )

  const { writeContractAsync: execute } = useWriteContract({
    mutation: {
      onSettled,
      onSuccess: (data: any) => {
        toast.custom((t) => (
          <CustomToast
            t={t}
            type="info"
            text={`Approve ${amount?.currency?.symbol}`}
            hash={data}
          />
        ))
        publicClient
          ?.waitForTransactionReceipt({ hash: data })
          .then(() => {
            refetch().then(() => {
              toast.custom((t) => (
                <CustomToast
                  t={t}
                  type="success"
                  text={`Approve ${amount?.currency?.symbol}`}
                  hash={data}
                />
              ))
              setPending(() => false)
            })
          })
          .catch(() => setPending(() => false))
      },
    },
  })

  return useMemo(() => {
    let state = ApprovalState.UNKNOWN
    if (amount?.currency.isNative) state = ApprovalState.APPROVED
    else if (allowance && amount && allowance.greaterThan(amount))
      state = ApprovalState.APPROVED
    else if (allowance && amount && allowance.equalTo(amount))
      state = ApprovalState.APPROVED
    else if (pending) state = ApprovalState.PENDING
    else if (isAllowanceLoading) state = ApprovalState.LOADING
    else if (allowance && amount && allowance.lessThan(amount))
      state = ApprovalState.NOT_APPROVED

    return [state, execute, data?.request]
  }, [allowance, amount, execute, isAllowanceLoading, pending])
}
