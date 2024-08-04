import { sanko } from "@/app/providers";
import {
  ODOS_EXECUTOR_V2_ADDR,
  ODOS_ROUTER_V2_ADDR,
} from "@/contracts";
import { routeProcessor3Abi } from "@/packages/abi";
import odosRouterV2Abi from "@/packages/abi/odosRouterV2Abi";
import { ChainId } from "@/packages/chain";
import { ROUTE_PROCESSOR_3_ADDRESS } from "@/packages/config";
import { Amount, Token, Type, WETH9_ADDRESS } from "@/packages/currency";
import { Percent } from "@/packages/math";
import { PoolCode, Router } from "@/packages/router";
import { RouteStatus } from "@/packages/tines";
import axios from "axios";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  formatUnits,
  http,
} from "viem";
import camelotYakRouterAbi from "@/packages/abi/camelotYakRouterAbi";

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  volumeUSD: number;
  tvlUSD: number;
  whitelisted: boolean;
  chainId: number;
  logoURI: string;
  common: boolean;
  defaultSwapInput?: boolean;
  defaultSwapOutput?: boolean;
  isWNative?: boolean;
  quote: string;
}

interface CamelotApiResponse {
  data: {
    tokens: Record<string, TokenData>;
  };
}

// Arbitrum One
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

export const getToobFinanceTrade = async (
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

    args = Router.routeProcessor3Params(
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

// Sanko Mainnet
export const getSankoToobFinanceTrade = async (
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
    ChainId.SANKO_MAINNET,
    tokenIn,
    BigInt(amountIn),
    tokenOut,
    100000,
    100
  );

  let tokenInPrice = 0;
  let tokenOutPrice = 0;

  try {
    const priceFeed = await axios.get<CamelotApiResponse>(
      `https://api.camelot.exchange/v2/tokens?chainId=${ChainId.SANKO_MAINNET}`
    );

    const tokens = priceFeed.data.data.tokens;

    const tokenInAddress =
      tokenIn instanceof Token
        ? tokenIn.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET];
    const tokenOutAddress =
      tokenOut instanceof Token
        ? tokenOut.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET];

    tokenInPrice = tokens[tokenInAddress]?.price ?? 0;
    tokenOutPrice = tokens[tokenOutAddress]?.price ?? 0;
  } catch (e) {
    console.log(e);
  }

  let args = Router.routeProcessor3Params(
    poolsCodeMap,
    route,
    tokenIn,
    tokenOut,
    recipient,
    ROUTE_PROCESSOR_3_ADDRESS[ChainId.SANKO_MAINNET],
    [],
    slippage / 100
  );

  if (route && route.status === RouteStatus.Success) {
    const amountIn = Amount.fromRawAmount(tokenIn, route.amountInBI.toString());
    const amountOut = Amount.fromRawAmount(
      tokenOut,
      route.amountOutBI.toString()
    );

    args = Router.routeProcessor3Params(
      poolsCodeMap,
      route,
      tokenIn,
      tokenOut,
      recipient,
      ROUTE_PROCESSOR_3_ADDRESS[ChainId.SANKO_MAINNET],
      [],
      +slippage / 100
    );

    const amountInFormatted = Number(
      formatUnits(amountIn.quotient, tokenIn.decimals)
    );
    const amountOutFormatted = Number(
      formatUnits(amountOut.quotient, tokenOut.decimals)
    );

    return {
      tokenIn,
      tokenOut,
      recipient,
      slippage,
      amountIn: amountIn.quotient.toString(),
      amountInValue: tokenInPrice * amountInFormatted,
      amountOut: amountOut.quotient.toString(),
      amountOutValue: tokenOutPrice * amountOutFormatted,
      priceImpact: Number(
        (route.priceImpact
          ? new Percent(BigInt(Math.round(route.priceImpact * 10000)), 10000n)
          : new Percent(0)
        ).toFixed(6)
      ),
      data: args,
      type: "Toob Finance",
    };
  } else {
    const publicClient = createPublicClient({
      chain: sanko,
      transport: http(),
    });

    const tokenInAddress =
      tokenIn instanceof Token
        ? tokenIn.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET];
    const tokenOutAddress =
      tokenOut instanceof Token
        ? tokenOut.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET];

    const YakRouter = "0xcABa97C49d3e08c4CA21938F1761A66454432eaD";

    const result = await publicClient.readContract({
      address: YakRouter,
      abi: camelotYakRouterAbi,
      functionName: "findBestPath",
      args: [
        BigInt(amountIn),
        tokenInAddress,
        tokenOutAddress,
        [tokenInAddress, tokenOutAddress],
        4n,
      ],
    });

    const amountOut =
      result.amounts && result.amounts.length > 0
        ? result.amounts[result.amounts.length - 1]
        : "0";

    const amountInFormatted = Number(
      formatUnits(BigInt(amountIn), tokenIn.decimals)
    );
    const amountOutFormatted = Number(
      formatUnits(BigInt(amountOut), tokenOut.decimals)
    );

    const amountInValue = tokenInPrice * amountInFormatted;
    const amountOutValue = tokenOutPrice * amountOutFormatted;

    return {
      tokenIn,
      tokenOut,
      recipient,
      slippage,
      amountIn: amountIn,
      amountInValue: amountInValue,
      amountOut: amountOut,
      amountOutValue: amountOutValue,
      priceImpact: (1 - amountOutValue / amountInValue) * 100,
      data: args,
      type: "Toob Finance",
    };
  }
};

// Arbitrum One
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
    abi: odosRouterV2Abi,
    functionName: "swap",
    args: [
      {
        inputToken: data?.inputTokens?.[0]?.tokenAddress ?? "",
        inputAmount: BigInt(data?.inputTokens?.[0]?.amount ?? "0"),
        inputReceiver: ODOS_EXECUTOR_V2_ADDR,
        outputToken: data?.outputTokens?.[0]?.tokenAddress ?? "",
        outputQuote: BigInt(data?.outputTokens?.[0]?.amount ?? "0"),
        outputMin:
          (BigInt(data?.outputTokens?.[0]?.amount ?? "0") *
            (1000000n - BigInt(trade.slippage * 10000))) /
          1000000n,
        outputReceiver: trade.recipient,
      },
      `0x${pathDefinition}`,
      ODOS_EXECUTOR_V2_ADDR,
      0,
    ],
  });

  return {
    amountIn: BigInt(data?.inputTokens?.[0]?.amount ?? "0"),
    amountOut: BigInt(data?.outputTokens?.[0]?.amount ?? "0"),
    args: {
      targetData,
      target: ODOS_ROUTER_V2_ADDR,
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

export const getToobFinanceTxData = async (trade: any) => {
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

export const getSankoToobFinanceTxData = async (trade: any) => {
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
      target: ROUTE_PROCESSOR_3_ADDRESS[ChainId.SANKO_MAINNET],
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
