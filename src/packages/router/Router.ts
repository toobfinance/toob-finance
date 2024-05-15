import {
  MultiRoute,
  NetworkInfo,
  RPool,
  RToken,
  findMultiRouteExactIn,
  getBigInt,
} from "../tines"
import { ChainId } from "../chain"
import { Token, Type, WNATIVE } from "../currency"
import { Address, Hex } from "viem"

import { getRouteProcessorCode } from "./TinesToRouteProcessor"
import { PermitData, getRouteProcessor2Code } from "./TinesToRouteProcessor2"
import { getRouteProcessor4Code } from "./TinesToRouteProcessor4"
import { LiquidityProviders } from "./liquidity-providers/LiquidityProvider"
import { PoolCode } from "./pools/PoolCode"

function TokenToRToken(t: Type): RToken {
  if (t instanceof Token) return t as RToken
  const nativeRToken: RToken = {
    address: "",
    name: t.name,
    symbol: t.symbol,
    chainId: t.chainId,
    decimals: 18,
  }
  return nativeRToken
}

export interface RPParams {
  tokenIn: Address
  amountIn: bigint
  tokenOut: Address
  amountOutMin: bigint
  to: Address
  routeCode: Hex
  value?: bigint
}

export type PoolFilter = (list: RPool) => boolean

export class Router {
  static findRouteType(
    poolCodesMap: Map<string, PoolCode>,
    addresses: string[]
  ) {
    // const poolCodes = addresses.map(address => poolCodesMap.get(address))
    if (
      addresses?.every((address) => {
        const poolName = poolCodesMap.get(address)?.poolName
        return (
          poolName?.startsWith("Wrap") ||
          poolName?.startsWith(LiquidityProviders.SushiSwapV2) ||
          poolName?.startsWith(LiquidityProviders.SushiSwapV3)
        )
      })
    ) {
      return "Internal"
    } else if (
      addresses?.some((address) => {
        const poolName = poolCodesMap.get(address)?.poolName
        return (
          !poolName?.startsWith("Wrap") &&
          (poolName?.startsWith(LiquidityProviders.SushiSwapV2) ||
            poolName?.startsWith(LiquidityProviders.SushiSwapV3))
        )
      }) &&
      addresses?.some((address) => {
        const poolName = poolCodesMap.get(address)?.poolName
        return (
          !poolName?.startsWith("Wrap") &&
          (!poolName?.startsWith(LiquidityProviders.SushiSwapV2) ||
            !poolName?.startsWith(LiquidityProviders.SushiSwapV3))
        )
      })
    ) {
      return "Mix"
    } else if (
      addresses?.some((address) => {
        const poolName = poolCodesMap.get(address)?.poolName
        return (
          poolName?.startsWith("Wrap") ||
          (!poolName?.startsWith(LiquidityProviders.SushiSwapV2) &&
            !poolName?.startsWith(LiquidityProviders.SushiSwapV3))
        )
      })
    ) {
      return "External"
    }

    return "Unknown"
  }

  static findBestRoute(
    poolCodesMap: Map<string, PoolCode>,
    chainId: ChainId,
    fromToken: Type,
    amountIn: bigint,
    toToken: Type,
    gasPrice: number,
    maxFlowNumber = 100,
    providers?: LiquidityProviders[], // all providers if undefined
    poolFilter?: PoolFilter
  ): MultiRoute {
    const networks: NetworkInfo[] = [
      {
        chainId: Number(chainId),
        baseToken: WNATIVE[chainId] as RToken,
        gasPrice: gasPrice as number,
      },
    ]

    let poolCodes = Array.from(poolCodesMap.values())
    if (providers) {
      poolCodes = poolCodes.filter((pc) =>
        [...providers, LiquidityProviders.NativeWrap].includes(
          pc.liquidityProvider
        )
      )
    }
    let pools = Array.from(poolCodes).map((pc) => pc.pool)

    if (poolFilter) pools = pools.filter(poolFilter)

    const route = findMultiRouteExactIn(
      TokenToRToken(fromToken),
      TokenToRToken(toToken),
      amountIn,
      pools,
      networks,
      gasPrice,
      maxFlowNumber
    )

    return {
      ...route,
      legs: route.legs.map((l) => ({
        ...l,
        poolName: poolCodesMap.get(l.poolAddress)?.poolName ?? "Unknown Pool",
      })),
    }
  }

  static routeProcessorParams(
    poolCodesMap: Map<string, PoolCode>,
    route: MultiRoute,
    fromToken: Type,
    toToken: Type,
    to: Address,
    RPAddr: Address,
    maxPriceImpact = 0.005
  ): RPParams {
    const tokenIn =
      fromToken instanceof Token
        ? (fromToken.address as Address)
        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const tokenOut =
      toToken instanceof Token
        ? (toToken.address as Address)
        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const amountOutMin =
      (route.amountOutBI * getBigInt((1 - maxPriceImpact) * 1_000_000)) /
      1_000_000n

    return {
      tokenIn,
      amountIn: route.amountInBI,
      tokenOut,
      amountOutMin,
      to,
      routeCode: getRouteProcessorCode(route, RPAddr, to, poolCodesMap) as Hex,
      value: fromToken instanceof Token ? undefined : route.amountInBI,
    }
  }

  static routeProcessor2Params(
    poolCodesMap: Map<string, PoolCode>,
    route: MultiRoute,
    fromToken: Type,
    toToken: Type,
    to: Address,
    RPAddr: Address,
    permits: PermitData[] = [],
    maxPriceImpact = 0.005
  ): RPParams {
    const tokenIn =
      fromToken instanceof Token
        ? (fromToken.address as Address)
        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const tokenOut =
      toToken instanceof Token
        ? (toToken.address as Address)
        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const amountOutMin =
      (route.amountOutBI * getBigInt((1 - maxPriceImpact) * 1_000_000)) /
      1_000_000n

    return {
      tokenIn,
      amountIn: route.amountInBI,
      tokenOut,
      amountOutMin,
      to,
      routeCode: getRouteProcessor2Code(
        route,
        RPAddr,
        RPAddr,
        poolCodesMap,
        permits
      ) as Hex,
      value: fromToken instanceof Token ? undefined : route.amountInBI,
    }
  }

  static routeProcessor3Params = this.routeProcessor2Params
  static routeProcessor3_1Params = this.routeProcessor2Params
  static routeProcessor3_2Params = this.routeProcessor2Params

  static routeProcessor4Params(
    poolCodesMap: Map<string, PoolCode>,
    route: MultiRoute,
    fromToken: Type,
    toToken: Type,
    to: Address,
    RPAddr: Address,
    permits: PermitData[] = [],
    maxPriceImpact = 0.005
  ): RPParams {
    const tokenIn =
      fromToken instanceof Token
        ? (fromToken.address as Address)
        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const tokenOut =
      toToken instanceof Token
        ? (toToken.address as Address)
        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const amountOutMin =
      (route.amountOutBI * getBigInt((1 - maxPriceImpact) * 1_000_000)) /
      1_000_000n

    return {
      tokenIn,
      amountIn: route.amountInBI,
      tokenOut,
      amountOutMin,
      to,
      routeCode: getRouteProcessor4Code(
        route,
        RPAddr,
        to,
        poolCodesMap,
        permits
      ) as Hex,
      value: fromToken instanceof Token ? undefined : route.amountInBI,
    }
  }

  // Human-readable route printing
  static routeToHumanString(
    poolCodesMap: Map<string, PoolCode>,
    route: MultiRoute,
    fromToken: Type,
    toToken: Type,
    shiftPrimary = "",
    shiftSub = "    "
  ): string {
    let res = ""
    res += `${shiftPrimary}Route Status: ${route.status}\n`
    res += `${shiftPrimary}Input: ${
      route.amountIn / 10 ** fromToken.decimals
    } ${fromToken.symbol}\n`
    route.legs.forEach((l, i) => {
      res += `${shiftSub}${i + 1}. ${l.tokenFrom.symbol} ${Math.round(
        l.absolutePortion * 100
      )}% -> [${poolCodesMap.get(l.poolAddress)?.poolName}] -> ${
        l.tokenTo.symbol
      }\n`
      //console.log(l.poolAddress, l.assumedAmountIn, l.assumedAmountOut)
    })
    const output =
      parseInt(route.amountOutBI.toString()) / 10 ** toToken.decimals
    res += `${shiftPrimary}Output: ${output} ${route.toToken.symbol}`

    return res
  }
}

export function tokenQuantityString(token: Type, amount: bigint) {
  const denominator = 10n ** BigInt(token.decimals)
  const integer = amount / denominator
  const fractional = amount - integer * denominator
  if (fractional === 0n) return `${integer} ${token.symbol}`
  const paddedFractional = fractional.toString().padStart(token.decimals, "0")
  return `${integer}.${paddedFractional} ${token.symbol}`
}
