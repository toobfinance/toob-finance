import { ChainId } from "../chain"

// v1
export const ROUTE_PROCESSOR_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
] as const
export type RouteProcessorChainId =
  (typeof ROUTE_PROCESSOR_SUPPORTED_CHAIN_IDS)[number]
export const ROUTE_PROCESSOR_ADDRESS: Record<
  RouteProcessorChainId,
  `0x${string}`
> = {
  [ChainId.ARBITRUM_ONE]: "0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0",
} as const
export const isRouteProcessorChainId = (
  chainId: ChainId
): chainId is RouteProcessorChainId =>
  ROUTE_PROCESSOR_SUPPORTED_CHAIN_IDS.includes(chainId as RouteProcessorChainId)

// v2
export const ROUTE_PROCESSOR_2_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
] as const
export type RouteProcessor2ChainId =
  (typeof ROUTE_PROCESSOR_2_SUPPORTED_CHAIN_IDS)[number]
export const ROUTE_PROCESSOR_2_ADDRESS: Record<
  RouteProcessor2ChainId,
  `0x${string}`
> = {
  [ChainId.ARBITRUM_ONE]: "0xA7caC4207579A179c1069435d032ee0F9F150e5c",
} as const
export const isRouteProcessor2ChainId = (
  chainId: ChainId
): chainId is RouteProcessor2ChainId =>
  ROUTE_PROCESSOR_2_SUPPORTED_CHAIN_IDS.includes(
    chainId as RouteProcessor2ChainId
  )

// v3
export const ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.SANKO_MAINNET,
] as const
export type RouteProcessor3ChainId =
  (typeof ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS)[number]
export const ROUTE_PROCESSOR_3_ADDRESS: Record<
  RouteProcessor3ChainId,
  `0x${string}`
> = {
  [ChainId.ARBITRUM_ONE]: "0xac80590497f35417A71B7D0873F33874Ee1266A8",
  [ChainId.SANKO_MAINNET]: "0xac80590497f35417A71B7D0873F33874Ee1266A8",
} as const
export const isRouteProcessor3ChainId = (
  chainId: ChainId
): chainId is RouteProcessor3ChainId =>
  ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS.includes(
    chainId as RouteProcessor3ChainId
  )
