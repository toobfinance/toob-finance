import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import useSwapParams from "../../hooks/useSwapParams";
import { Amount, Token, tryParseAmount } from "@/packages/currency";
import Spinner from "../Spinner";
import React, { useState } from "react";
import { ApprovalState, useTokenApproval } from "@/hooks/useTokenApproval";
import { ChainId } from "@/packages/chain";
import { getKyberTxData, getOdosTxData, getToobFinanceTxData } from "@/utils/trade";
import toast from "react-hot-toast";
import CustomToast from "../CustomToast";
import { erc20Abi } from "viem";
import { UseQueryResult } from "@tanstack/react-query";
import { ROUTE_PROCESSOR_3_ADDRESS } from "@/packages/config/trade";
import { ODOS_ROUTER_V2_ADDR } from "@/contracts";

interface SwapButtonProps {
  trade: UseQueryResult<any, Error>;
  lockedRouter: any;
  setLockedRouter: React.Dispatch<React.SetStateAction<any>>;
}

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

const SwapButton: React.FC<SwapButtonProps> = ({
  trade,
  lockedRouter,
  setLockedRouter,
}) => {
  const { address, chainId } = useAccount();
  const { open } = useWeb3Modal();
  const { amountIn, tokenIn, tokenOut, setAmountIn } = useSwapParams();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [loading, setLoading] = useState(false);

  const routerAddress = lockedRouter
    ? lockedRouter.type === "Toob Finance"
      ? ROUTE_PROCESSOR_3_ADDRESS[ChainId.ARBITRUM_ONE]
      : lockedRouter.type === "Odos"
      ? ODOS_ROUTER_V2_ADDR
      : lockedRouter.data?.routerAddress ?? ADDRESS_ZERO
    : trade.data?.[0]?.type === "Toob Finance"
    ? ROUTE_PROCESSOR_3_ADDRESS[ChainId.ARBITRUM_ONE]
    : trade.data?.[0]?.type === "Odos"
    ? ODOS_ROUTER_V2_ADDR
    : trade.data?.[0]?.data?.routerAddress ?? ADDRESS_ZERO;

  const parsedAmount = tryParseAmount(amountIn, tokenIn);

  const [approvalState, approve, approvalRequest] = useTokenApproval({
    amount: parsedAmount,
    spender: routerAddress,
    enabled: Boolean(parsedAmount) && Boolean(routerAddress !== ADDRESS_ZERO),
  });

  const onSwap = async () => {
    if (!address || !publicClient || !walletClient) {
      open?.();
    } else if (chainId !== ChainId.ARBITRUM_ONE) {
      switchChainAsync?.({ chainId: ChainId.ARBITRUM_ONE });
    } else {
      try {
        if (!tokenIn || !tokenOut) return;

        let currentRouter = lockedRouter;
        if (!currentRouter && trade.data?.[0]) {
          setLockedRouter(trade.data[0]);
          currentRouter = trade.data[0];
        }

        if (!currentRouter) return;

        setLoading(true);

        const txData =
          currentRouter.type === "Odos"
            ? await getOdosTxData(currentRouter)
            : currentRouter.type === "KyberSwap"
            ? await getKyberTxData(currentRouter)
            : await getToobFinanceTxData(currentRouter);

        const balanceBefore = tokenOut.isNative
          ? await publicClient.getBalance({ address })
          : await publicClient.readContract({
              abi: erc20Abi,
              address: tokenOut.address,
              functionName: "balanceOf",
              args: [address],
            });

        const hash = await walletClient.sendTransaction({
          account: address,
          data: txData.args.targetData,
          to: txData.args.target,
          value: txData.value,
        });

        const balanceAfter = tokenOut.isNative
          ? await publicClient.getBalance({ address })
          : await publicClient.readContract({
              abi: erc20Abi,
              address: tokenOut.address,
              functionName: "balanceOf",
              args: [address],
            });

        toast.custom((t) => (
          <CustomToast
            t={t}
            type="success"
            text={`Swap ${Amount.fromRawAmount(
              tokenIn,
              txData.amountIn
            ).toSignificant(6)} ${
              currentRouter.tokenIn.symbol
            } for ${Amount.fromRawAmount(
              tokenOut,
              balanceAfter - balanceBefore
            ).toSignificant(6)} ${currentRouter.tokenOut.symbol}`}
            hash={hash}
          />
        ));

        setAmountIn("");
        setLockedRouter(null);
      } catch (err: any) {
        console.log(err);
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
          ));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const onApprove = async () => {
    if (trade.data) {
      setLockedRouter(trade.data[0]);
      try {
        await approve(approvalRequest);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const { data: balance } = useBalance({
    address,
    token: tokenIn instanceof Token ? tokenIn.address : undefined,
    query: {
      enabled: Boolean(address) && Boolean(tokenIn),
      refetchInterval: 30000,
    },
  });

  const fetching =
    Boolean(tokenIn) &&
    Boolean(tokenOut) &&
    Boolean(parsedAmount?.greaterThan(0n)) &&
    (trade.isFetching || trade.isLoading || trade.isPending);
  const wrongNetworkError = chainId !== ChainId.ARBITRUM_ONE;
  const nonAssetError = !tokenIn || !tokenOut;
  const nonAmountError = !(
    tokenIn &&
    amountIn &&
    tryParseAmount(amountIn, tokenIn)?.greaterThan(0n)
  );
  const insufficientBalanceError =
    Number(amountIn) > Number(balance?.formatted ?? "0");

  const isError = nonAmountError || nonAssetError || insufficientBalanceError;

  return (
    <div className="mt-4">
      {!fetching &&
      !isError &&
      trade.data &&
      (approvalState === ApprovalState.NOT_APPROVED ||
        approvalState === ApprovalState.PENDING) ? (
        <button
          className="flex items-center justify-center h-12 w-full bg-black dark:bg-white text-white dark:text-black border-b-2 border-[#222] dark:border-[#aaa] enabled:hover:brightness-90 transition-all rounded-full mt-8 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
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
        className="flex items-center justify-center h-12 w-full bg-black dark:bg-white text-white dark:text-black border-b-2 border-[#222] dark:border-[#aaa] enabled:hover:brightness-90 transition-all rounded-full font-semibold disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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
  );
};

export default SwapButton;
