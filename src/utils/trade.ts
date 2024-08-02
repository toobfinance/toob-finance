import { sanko } from "@/app/providers";
import {
  CAMELOT_V2_ROUTER_ADDR_SANKO,
  CAMELOT_V3_ROUTER_ADDR_SANKO,
  ODOS_EXECUTOR_V2_ADDR,
  ODOS_ROUTER_V2_ADDR,
} from "@/contracts";
import { routeProcessor3Abi } from "@/packages/abi";
import camelotV2FactoryAbi from "@/packages/abi/camelotV2FactoryAbi";
import camelotV2PairAbi from "@/packages/abi/camelotV2PairAbi";
import camelotV2RouterAbi from "@/packages/abi/camelotV2RouterAbi";
import camelotV3QuoterAbi from "@/packages/abi/camelotV3QuoterAbi";
import camelotV3RouterAbi from "@/packages/abi/camelotV3RouterAbi";
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
export const getCamelotV2Trade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string
) => {
  const Factory = "0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4";

  const publicClient = createPublicClient({
    chain: sanko,
    transport: http(),
  });

  const pairAddr = await publicClient.readContract({
    address: Factory,
    abi: camelotV2FactoryAbi,
    functionName: "getPair",
    args: [
      tokenIn instanceof Token
        ? tokenIn.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
      tokenOut instanceof Token
        ? tokenOut.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
    ],
  });

  const amountOut = await publicClient.readContract({
    address: pairAddr,
    abi: camelotV2PairAbi,
    functionName: "getAmountOut",
    args: [
      BigInt(amountIn),
      tokenIn instanceof Token
        ? tokenIn.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
    ],
  });

  return {
    tokenIn,
    tokenOut,
    recipient,
    slippage,
    amountIn,
    amountInValue: formatUnits(BigInt(amountIn), 18),
    amountOut,
    amountOutValue: formatUnits(amountOut, 18),
    type: "Camelot V2",
  };
};

export const getCamelotV3Trade = async (
  tokenIn: Type,
  tokenOut: Type,
  recipient: Address,
  slippage: number,
  amountIn: string
) => {
  const Quoter = "0x52CFD1d72A64f8D13711bb7Dc3899653dbd4191B";

  const publicClient = createPublicClient({
    chain: sanko,
    transport: http(),
  });

  const { result } = await publicClient.simulateContract({
    address: Quoter,
    abi: camelotV3QuoterAbi,
    functionName: "quoteExactInputSingle",
    args: [
      tokenIn instanceof Token
        ? tokenIn.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
      tokenOut instanceof Token
        ? tokenOut.address
        : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
      BigInt(amountIn),
      BigInt(0),
    ],
  });

  const amountOut = result[0] ?? "0";

  return {
    tokenIn,
    tokenOut,
    recipient,
    slippage,
    amountIn,
    amountInValue: formatUnits(BigInt(amountIn), 18),
    amountOut,
    amountOutValue: formatUnits(amountOut, 18),
    type: "Camelot V3",
  };
};

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
    10000000,
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
    const Quoter = "0x52CFD1d72A64f8D13711bb7Dc3899653dbd4191B";

    const publicClient = createPublicClient({
      chain: sanko,
      transport: http(),
    });

    const { result } = await publicClient.simulateContract({
      address: Quoter,
      abi: camelotV3QuoterAbi,
      functionName: "quoteExactInputSingle",
      args: [
        tokenIn instanceof Token
          ? tokenIn.address
          : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
        tokenOut instanceof Token
          ? tokenOut.address
          : WETH9_ADDRESS[ChainId.SANKO_MAINNET],
        BigInt(amountIn),
        BigInt(0),
      ],
    });

    const amountOut = result[0] ?? "0";

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

// Sanko Mainnet
export const getCamelotV2TxData = async (trade: any) => {
  const isTokenInNative = trade.tokenIn.isNative;
  const isTokenOutNative = trade.tokenOut.isNative;

  const targetData = encodeFunctionData({
    abi: camelotV2RouterAbi,
    functionName: isTokenInNative
      ? "swapExactETHForTokens"
      : isTokenOutNative
      ? "swapExactTokensForETH"
      : "swapExactTokensForTokens",
    args: [
      BigInt(trade.amountIn),
      BigInt(trade.amountOutMin),
      isTokenInNative
        ? [WETH9_ADDRESS[ChainId.SANKO_MAINNET], trade.tokenOut.address]
        : isTokenOutNative
        ? [trade.tokenIn.address, WETH9_ADDRESS[ChainId.SANKO_MAINNET]]
        : [trade.tokenIn.address, trade.tokenOut.address],
      trade.recipient,
      BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
    ],
  });

  return {
    amountIn: BigInt(trade.amountIn),
    amountOut: BigInt(trade.amountOut),
    args: {
      target: CAMELOT_V2_ROUTER_ADDR_SANKO,
      tokenIn: isTokenInNative
        ? WETH9_ADDRESS[ChainId.SANKO_MAINNET]
        : trade.tokenIn.address,
      targetData,
      amountIn: BigInt(trade.amountIn),
      fee: false,
    },
    value: isTokenInNative ? BigInt(trade.amountIn) : 0n,
  };
};

export const getCamelotV3TxData = async (trade: any) => {
  console.log(trade);
  const isTokenInNative = trade.tokenIn.isNative;
  const isTokenOutNative = trade.tokenOut.isNative;

  const tokenInAddress = isTokenInNative
    ? WETH9_ADDRESS[ChainId.SANKO_MAINNET]
    : trade.tokenIn.address;
  const tokenOutAddress = isTokenOutNative
    ? WETH9_ADDRESS[ChainId.SANKO_MAINNET]
    : trade.tokenOut.address;

  console.log(tokenInAddress, tokenOutAddress);

  let targetData;

  // if (!isTokenInNative && !isTokenOutNative) {
  //   targetData = encodeFunctionData({
  //     abi: camelotYakRouterAbi,
  //     functionName: "exactInputSingle",
  //     args: [
  //       {
  //         tokenIn: tokenInAddress,
  //         tokenOut: tokenOutAddress,
  //         recipient: trade.recipient,
  //         deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
  //         amountIn: BigInt(trade.amountIn),
  //         amountOutMinimum: BigInt(0),
  //         limitSqrtPrice: BigInt(0),
  //       },
  //     ],
  //   });
  // } else {
  targetData = encodeFunctionData({
    abi: camelotV3RouterAbi,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        recipient: trade.recipient,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
        amountIn: BigInt(trade.amountIn),
        amountOutMinimum: BigInt(0),
        limitSqrtPrice: BigInt(0),
      },
    ],
  });
  // }

  return {
    amountIn: BigInt(trade.amountIn),
    amountOut: BigInt(trade.amountOut),
    args: {
      target: CAMELOT_V3_ROUTER_ADDR_SANKO,
      tokenIn: tokenInAddress,
      targetData,
      amountIn: BigInt(trade.amountIn),
      fee: false,
    },
    value: isTokenInNative ? BigInt(trade.amountIn) : 0n,
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
