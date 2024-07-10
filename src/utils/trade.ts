import { sanko } from "@/app/providers";
import { ODOS_EXECUTOR_ADDR, ODOS_ROUTER_ADDR } from "@/contracts";
import { routeProcessor3Abi } from "@/packages/abi";
import camelotV2FactoryAbi from "@/packages/abi/camelot/camelotV2FactoryAbi";
import camelotV2PairAbi from "@/packages/abi/camelot/camelotV2PairAbi";
import camelotV3QuoterAbi from "@/packages/abi/camelot/camelotV3QuoterAbi";
import kyberSwapAbi from "@/packages/abi/kyberSwapAbi";
import toobFinanceRouter from "@/packages/abi/toobFinanceRouter";
import { slippageAmount } from "@/packages/calculate";
import { ChainId } from "@/packages/chain";
import { ROUTE_PROCESSOR_3_ADDRESS } from "@/packages/config";
import { Amount, Token, Type } from "@/packages/currency";
import { Percent } from "@/packages/math";
import { getAllPoolsCodeMap } from "@/packages/pools/actions/getAllPoolsCodeMap";
import { PoolCode, Router } from "@/packages/router";
import { RouteStatus } from "@/packages/tines";
import axios from "axios";
import { Address, Hex, createPublicClient, defineChain, encodeFunctionData, formatUnits, http, parseUnits } from "viem";

export const getOdosTrade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string
) => {
  try {
    const { data } = await axios.post("https://api.odos.xyz/sor/quote/v2", {
      chainId: 42161,
      inputTokens: [
        {
          tokenAddress:
            tokenIn instanceof Token
              ? tokenIn.address
              : "0x0000000000000000000000000000000000000000",
          amount: amountIn,
        },
      ],
      outputTokens: [
        {
          tokenAddress:
            tokenOut instanceof Token
              ? tokenOut.address
              : "0x0000000000000000000000000000000000000000",
          proportion: 1,
        },
      ],
      userAddr: recipient,
      slippageLimitPercent: slippage,
      pathViz: true,
      referralCode: 0,
      compact: true,
      likeAsset: true,
      disableRFQs: false,
    });
    return {
      tokenIn,
      tokenOut,
      recipient,
      slippage,
      amountIn: data?.inAmounts?.[0] ?? "0",
      amountInValue: data?.inValues?.[0] ?? 0,
      amountOut: data?.outAmounts?.[0] ?? "0",
      amountOutValue: data?.outValues?.[0] ?? 0,
      priceImpact: -(data?.percentDiff ?? 0),
      data,
      type: "Odos",
    };
  } catch (err) {
    console.log(err);
  }
};

export const getKyberTrade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string
) => {
  try {
    const { data } = await axios.get(
      `https://aggregator-api.kyberswap.com/arbitrum/api/v1/routes?tokenIn=${
        tokenIn instanceof Token
          ? tokenIn.address
          : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      }&tokenOut=${
        tokenOut instanceof Token
          ? tokenOut.address
          : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      }&amountIn=${amountIn}&gasInclude=true`
    );
    if (data?.message !== "successfully") return undefined;
    return {
      tokenIn,
      tokenOut,
      recipient,
      slippage,
      amountIn: data?.data?.routeSummary?.amountIn ?? "0",
      amountInValue: Number(data?.data?.routeSummary?.amountInUsd ?? "0"),
      amountOut: data?.data?.routeSummary?.amountOut ?? "0",
      amountOutValue: Number(data?.data?.routeSummary?.amountOutUsd ?? "0"),
      priceImpact:
        data?.data?.routeSummary?.amountInUsd &&
        data?.data?.routeSummary?.amountOutUsd
          ? -(
              Number(data.data.routeSummary.amountOutUsd) /
                Number(data.data.routeSummary.amountInUsd) -
              1
            ) * 100
          : 0,
      data: data?.data,
      type: "KyberSwap",
    };
  } catch (err) {
    console.log(err);
  }
};

export const getXFusionTrade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string,
  poolsCodeMap?: Map<string, PoolCode>
) => {
  if (!poolsCodeMap) return undefined;
  const route = Router.findBestRoute(
    poolsCodeMap,
    ChainId.ARBITRUM_ONE,
    tokenIn,
    BigInt(amountIn),
    tokenOut,
    10000000,
    100
  );

  let args = Router.routeProcessor3Params(
    poolsCodeMap,
    route,
    tokenIn,
    tokenOut,
    recipient,
    ROUTE_PROCESSOR_3_ADDRESS[ChainId.ARBITRUM_ONE],
    [],
    slippage / 100
  );

  if (route && route.status === RouteStatus.Success) {
    const amountIn = Amount.fromRawAmount(tokenIn, route.amountInBI.toString());
    const amountOut = Amount.fromRawAmount(
      tokenOut,
      route.amountOutBI.toString()
    );

    const args = Router.routeProcessor3Params(
      poolsCodeMap,
      route,
      tokenIn,
      tokenOut,
      recipient,
      ROUTE_PROCESSOR_3_ADDRESS[ChainId.ARBITRUM_ONE],
      [],
      +slippage / 100
    );

    return {
      tokenIn,
      tokenOut,
      recipient,
      slippage,
      amountIn: amountIn.quotient.toString(),
      amountInValue: 0,
      amountOut: amountOut.quotient.toString(),
      amountOutValue: 0,
      priceImpact: Number(
        (route.priceImpact
          ? new Percent(BigInt(Math.round(route.priceImpact * 10000)), 10000n)
          : new Percent(0)
        ).toFixed(6)
      ),
      data: args,
      type: "Toob Finance",
    };
  }
};

export const getOdosTxData = async (trade: any) => {
  const { data } = await axios.post("https://api.odos.xyz/sor/assemble", {
    pathId: trade.data?.pathId,
    simulate: false,
    userAddr: trade.recipient,
  });

  const pathDefinition =
    data?.transaction?.data
      ?.toLowerCase()
      ?.split(trade.recipient.slice(2).toLowerCase())?.[1]
      ?.slice(10) ?? "";

  const targetData = encodeFunctionData({
    abi: toobFinanceRouter,
    functionName: "swap",
    args: [
      {
        inputAmount: BigInt(data?.inputTokens?.[0]?.amount ?? "0"),
        inputToken: data?.inputTokens?.[0]?.tokenAddress ?? "",
        outputToken: data?.outputTokens?.[0]?.tokenAddress ?? "",
        outputReceiver: trade.recipient,
        inputReceiver: ODOS_EXECUTOR_ADDR,
        outputQuote: BigInt(data?.outputTokens?.[0]?.amount ?? "0"),
        outputMin:
          (BigInt(data?.outputTokens?.[0]?.amount ?? "0") *
            (1000000n - BigInt(trade.slippage * 10000))) /
          1000000n,
      },
      `0x${pathDefinition}`,
      ODOS_EXECUTOR_ADDR,
    ],
  });

  return {
    amountIn: BigInt(data?.inputTokens?.[0]?.amount ?? "0"),
    amountOut: BigInt(data?.outputTokens?.[0]?.amount ?? "0"),
    args: {
      targetData,
      target: ODOS_ROUTER_ADDR,
      tokenIn:
        trade.tokenIn instanceof Token
          ? trade.tokenIn.address
          : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      amountIn: BigInt(data?.inputTokens?.[0]?.amount ?? "0"),
      fee: false,
    },
    value: data?.transaction?.value,
  };
};

export const getKyberTxData = async (trade: any) => {
  const { data } = await axios.post(
    "https://aggregator-api.kyberswap.com/arbitrum/api/v1/route/build",
    {
      routeSummary: trade?.data?.routeSummary,
      recipient: trade.recipient,
      sender: trade.recipient,
      skipSimulateTx: false,
      slippageTolerance: trade.slippage * 100,
    }
  );

  return {
    amountIn: BigInt(data?.data?.amountIn ?? "0"),
    amountOut: BigInt(data?.data?.amountOut ?? "0"),
    args: {
      targetData: data?.data?.data,
      target: data?.data?.routerAddress,
      tokenIn:
        trade.tokenIn instanceof Token
          ? trade.tokenIn.address
          : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      amountIn: BigInt(data?.data?.amountIn ?? "0"),
      fee: false,
    },
    value: trade.tokenIn?.isNative
      ? BigInt(data?.data?.amountIn ?? "0")
      : undefined,
  };
};

export const getXFusionTxData = async (trade: any) => {
  const targetData = encodeFunctionData({
    abi: routeProcessor3Abi,
    functionName: "toobExecute",
    args: [
      trade.data?.tokenIn,
      trade.data?.amountIn,
      trade.data?.tokenOut,
      trade.data?.amountOutMin,
      0n,
      trade.data?.to,
      trade.data?.routeCode,
    ],
  });
  return {
    amountIn: BigInt(trade?.amountIn ?? "0"),
    amountOut: BigInt(trade?.amountOut ?? "0"),
    args: {
      target: ROUTE_PROCESSOR_3_ADDRESS[ChainId.ARBITRUM_ONE],
      tokenIn:
        trade.tokenIn instanceof Token
          ? trade.tokenIn.address
          : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      targetData,
      amountIn: BigInt(trade.data?.amountIn ?? "0"),
      fee: false,
    },
    value: trade?.data?.value,
  };
};

export const getCamelotV3Trade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string
) => {
  const USDC = '0x13D675BC5e659b11CFA331594cF35A20815dCF02'
  const WDMT = '0x754cDAd6f5821077d6915004Be2cE05f93d176f8'
  // const Factory = '0xcF8d0723e69c6215523253a190eB9Bc3f68E0FFa'
  const Quoter = '0x52CFD1d72A64f8D13711bb7Dc3899653dbd4191B'

  const publicClient = createPublicClient({
    chain: sanko,
    transport: http()
  })

  const { result } = await publicClient.simulateContract({
    address: Quoter,
    abi: camelotV3QuoterAbi,
    functionName: 'quoteExactInputSingle',
    args: [USDC, WDMT, parseUnits('10', 6), BigInt(0)],
  })

  const amountOut = result[0] ?? '0'
  
  return {
    tokenIn,
    tokenOut,
    recipient,
    slippage,
    amountIn,
    amountOut,
    amountOutValue: formatUnits(amountOut, 18),
    type: 'Camelot V3',
  };
};

export const getCamelotV2Trade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string
) => {
  const USDC = '0x13D675BC5e659b11CFA331594cF35A20815dCF02'
  const WDMT = '0x754cDAd6f5821077d6915004Be2cE05f93d176f8'
  const Factory = '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4'

  const publicClient = createPublicClient({
    chain: sanko,
    transport: http()
  })

  const pairAddr = await publicClient.readContract({
    address: Factory,
    abi: camelotV2FactoryAbi,
    functionName: 'getPair',
    args: [USDC, WDMT],
  })

  const amountOut = await publicClient.readContract({
    address: pairAddr,
    abi: camelotV2PairAbi,
    functionName: 'getAmountOut',
    args: [parseUnits('10', 6), USDC],
  })

  return {
    tokenIn,
    tokenOut,
    recipient,
    slippage,
    amountIn,
    amountOut,
    amountOutValue: formatUnits(amountOut, 18),
    type: 'Camelot V2',
  };
};
