import { ChainId } from "../chain";

// v1
export const ROUTE_PROCESSOR_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.SANKO_MAINNET,
] as const;
export type RouteProcessorChainId =
  (typeof ROUTE_PROCESSOR_SUPPORTED_CHAIN_IDS)[number];
export const ROUTE_PROCESSOR_ADDRESS: Record<
  RouteProcessorChainId,
  `0x${string}`
> = {
  [ChainId.ARBITRUM_ONE]: "0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0",
  [ChainId.SANKO_MAINNET]: "0x000000000000000000000000000000000000000", // Not supported
} as const;
export const isRouteProcessorChainId = (
  chainId: ChainId
): chainId is RouteProcessorChainId =>
  ROUTE_PROCESSOR_SUPPORTED_CHAIN_IDS.includes(
    chainId as RouteProcessorChainId
  );

// v2
export const ROUTE_PROCESSOR_2_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.SANKO_MAINNET,
] as const;
export type RouteProcessor2ChainId =
  (typeof ROUTE_PROCESSOR_2_SUPPORTED_CHAIN_IDS)[number];
export const ROUTE_PROCESSOR_2_ADDRESS: Record<
  RouteProcessor2ChainId,
  `0x${string}`
> = {
  [ChainId.ARBITRUM_ONE]: "0xA7caC4207579A179c1069435d032ee0F9F150e5c",
  [ChainId.SANKO_MAINNET]: "0x000000000000000000000000000000000000000", // Not supported
} as const;
export const isRouteProcessor2ChainId = (
  chainId: ChainId
): chainId is RouteProcessor2ChainId =>
  ROUTE_PROCESSOR_2_SUPPORTED_CHAIN_IDS.includes(
    chainId as RouteProcessor2ChainId
  );

// v3
export const ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.SANKO_MAINNET,
] as const;
export type RouteProcessor3ChainId =
  (typeof ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS)[number];
export const ROUTE_PROCESSOR_3_ADDRESS: Record<
  RouteProcessor3ChainId,
  `0x${string}`
> = {
  [ChainId.ARBITRUM_ONE]: "0x9fC90524c767Fa9709Acf301BAE1dB4FAA604fc3",
  [ChainId.SANKO_MAINNET]: "0x336eC15830dd3891FfAB3f9a15660f8FeC00A611",
} as const;
export const isRouteProcessor3ChainId = (
  chainId: ChainId
): chainId is RouteProcessor3ChainId =>
  ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS.includes(
    chainId as RouteProcessor3ChainId
  );
