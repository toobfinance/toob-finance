import { UseTradeParams } from "../router";
import { usePrice } from "../prices";
import { Router } from "../router";
import { useQuery } from "@tanstack/react-query";
import { slippageAmount } from "../calculate";
import { ROUTE_PROCESSOR_3_ADDRESS, isRouteProcessor3ChainId } from "../config";
import { Amount, Native, WNATIVE_ADDRESS } from "../currency";
import { Percent } from "../math";
import { Address, Hex } from "viem";
import { useGasPrice } from "wagmi";
import { usePoolsCodeMap } from "../pools";

export const useClientTrade = (variables: UseTradeParams) => {
  const {
    chainId,
    fromToken,
    toToken,
    slippagePercentage,
    amount,
    enabled,
    recipient,
    maxFlowNumber,
    providers,
  } = variables;

  const { data: feeData } = useGasPrice({ chainId });

  const { data: price } = usePrice({
    chainId,
    address: WNATIVE_ADDRESS[chainId],
  });
  const { data: poolsCodeMap } = usePoolsCodeMap({
    chainId,
    currencyA: fromToken,
    currencyB: toToken,
    providers,
    enabled,
  });

  return useQuery({
    queryKey: [
      "useClientTrade",
      {
        chainId,
        currencyA: fromToken,
        currencyB: toToken,
        amount,
        slippagePercentage,
        recipient,
        poolsCodeMap,
        maxFlowNumber,
        providers,
      },
    ],
    queryFn: async function () {
      if (
        !poolsCodeMap ||
        !isRouteProcessor3ChainId(chainId) ||
        !fromToken ||
        !amount ||
        !toToken ||
        !feeData
      )
        return {
          abi: undefined,
          address: undefined,
          swapPrice: undefined,
          priceImpact: undefined,
          amountIn: undefined,
          amountOut: undefined,
          minAmountOut: undefined,
          gasSpent: undefined,
          writeArgs: undefined,
          route: undefined,
          functionName: "processRoute",
          value: undefined,
        };

      const route = Router.findBestRoute(
        poolsCodeMap,
        chainId,
        fromToken,
        amount.quotient,
        toToken,
        Number(feeData),
        maxFlowNumber,
        providers
      );

      let args = undefined;

      if (recipient) {
        args = Router.routeProcessor3Params(
          poolsCodeMap,
          route,
          fromToken,
          toToken,
          recipient,
          ROUTE_PROCESSOR_3_ADDRESS[chainId],
          [],
          +slippagePercentage / 100
        );
      }

      if (route) {
        const amountIn = Amount.fromRawAmount(
          fromToken,
          route.amountInBI.toString()
        );
        const amountOut = Amount.fromRawAmount(
          toToken,
          route.amountOutBI.toString()
        );

        // let writeArgs: UseTradeReturnWriteArgs = args
        let writeArgs = args
          ? [
              args.tokenIn as Address,
              args.amountIn,
              args.tokenOut as Address,
              args.amountOutMin,
              0n,
              args.to as Address,
              args.routeCode as Hex,
            ]
          : undefined;

        // const overrides = fromToken.isNative && writeArgs?.[1] ? { value: BigNumber.from(writeArgs?.[1]) } : undefined
        let value =
          fromToken.isNative && writeArgs?.[1] ? writeArgs[1] : undefined;

        return new Promise((res) =>
          setTimeout(
            () =>
              res({
                swapPrice: route.swapPrice,
                priceImpact: route.priceImpact
                  ? new Percent(
                      BigInt(Math.round(route.priceImpact * 10000)),
                      10000n
                    )
                  : new Percent(0),
                amountIn,
                amountOut,
                minAmountOut:
                  typeof writeArgs?.[3] === "bigint"
                    ? Amount.fromRawAmount(toToken, writeArgs[3])
                    : Amount.fromRawAmount(
                        toToken,
                        slippageAmount(
                          amountOut,
                          new Percent(Math.floor(0.5 * 100), 10_000)
                        )[0]
                      ),
                gasSpent:
                  price && feeData
                    ? Amount.fromRawAmount(
                        Native.onChain(chainId),
                        feeData * BigInt(route.gasSpent * 1.2)
                      ).toSignificant(4)
                    : undefined,
                route,
                functionName: "processRoute",
                writeArgs,
                value,
              }),
            250
          )
        );
      }
    },
    refetchInterval: 35000,
    enabled: Boolean(
      enabled && poolsCodeMap && feeData && fromToken && toToken && chainId
    ),
    refetchOnWindowFocus: false,
  });
};
