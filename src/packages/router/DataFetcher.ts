import { config } from "../config";
import { ChainId } from "../chain";
import { Type } from "../currency";
import { PublicClient, createPublicClient } from "viem";

import {
  LiquidityProvider,
  LiquidityProviders,
} from "./liquidity-providers/LiquidityProvider";
import type { PoolCode } from "./pools/PoolCode";
import {
  NativeWrapProvider,
  UniswapV2Provider,
  UniswapV3Provider,
  CamelotSwapV2Provider,
  CamelotSwapV3Provider,
  PancakeSwapV2Provider,
  PancakeSwapV3Provider,
  TraderJoeProvider,
  SushiSwapV2Provider,
  SushiSwapV3Provider,
} from ".";

// Gathers pools info, creates routing in 'incremental' mode
// This means that new routing recalculates each time new pool fetching data comes
export class DataFetcher {
  chainId: ChainId;
  providers: LiquidityProvider[] = [];
  // Provider to poolAddress to PoolCode
  poolCodes: Map<LiquidityProviders, Map<string, PoolCode>> = new Map();
  stateId = 0;
  web3Client1: PublicClient;
  // web3Client2: PublicClient;
  // web3Client3: PublicClient;

  // TODO: maybe use an actual map
  // private static cache = new Map<number, DataFetcher>()

  private static cache: Record<number, DataFetcher> = {};

  static onChain(chainId: ChainId): DataFetcher {
    const cache = this.cache[chainId];
    if (cache) {
      return cache;
    }

    const dataFetcher = new DataFetcher(chainId);

    this.cache[chainId] = dataFetcher;
    return dataFetcher;
  }

  constructor(
    chainId: ChainId,
    publicClient1?: PublicClient,
    publicClient2?: PublicClient,
    publicClient3?: PublicClient
  ) {
    this.chainId = chainId;
    if (!publicClient1 && !config[this.chainId]) {
      throw new Error(
        `No public client given and no viem config found for chainId ${chainId}`
      );
    }

    this.web3Client1 =
      publicClient1 ?? createPublicClient(config[this.chainId][0]);

    // this.web3Client2 =
    //   publicClient2 ?? createPublicClient(config[this.chainId][1]);

    // this.web3Client3 =
    //   publicClient3 ?? createPublicClient(config[this.chainId][2]);
  }

  _providerIsIncluded(
    lp: LiquidityProviders,
    liquidity?: LiquidityProviders[]
  ) {
    if (!liquidity) return true;
    if (lp === LiquidityProviders.NativeWrap) return true;
    return liquidity.some((l) => l === lp);
  }

  // Starts pool data fetching
  startDataFetching(
    providers?: LiquidityProviders[] // all providers if undefined
  ) {
    this.stopDataFetching();
    this.poolCodes = new Map();

    this.providers = [new NativeWrapProvider(this.chainId, this.web3Client1)];

    if (this._providerIsIncluded(LiquidityProviders.SushiSwapV2, providers)) {
      try {
        const provider = new SushiSwapV2Provider(
          this.chainId,
          this.web3Client1
        );
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.SushiSwapV3, providers)) {
      try {
        const provider = new SushiSwapV3Provider(
          this.chainId,
          this.web3Client1
        );
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.UniSwapV2, providers)) {
      try {
        const provider = new UniswapV2Provider(this.chainId, this.web3Client1);
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.UniSwapV3, providers)) {
      try {
        const provider = new UniswapV3Provider(this.chainId, this.web3Client1);
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.CamelotSwapV2, providers)) {
      try {
        const provider = new CamelotSwapV2Provider(
          this.chainId,
          this.web3Client1
        );
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.CamelotSwapV3, providers)) {
      try {
        const provider = new CamelotSwapV3Provider(
          this.chainId,
          this.web3Client1
        );
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.TraderJoe, providers)) {
      try {
        const provider = new TraderJoeProvider(this.chainId, this.web3Client1);
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.PancakeSwapV2, providers)) {
      try {
        const provider = new PancakeSwapV2Provider(
          this.chainId,
          this.web3Client1
        );
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    if (this._providerIsIncluded(LiquidityProviders.PancakeSwapV3, providers)) {
      try {
        const provider = new PancakeSwapV3Provider(
          this.chainId,
          this.web3Client1
        );
        this.providers.push(provider);
      } catch (e: unknown) {
        console.warn(e);
      }
    }

    this.providers.forEach((p) => p.startFetchPoolsData());
  }

  // To stop fetch pool data
  stopDataFetching() {
    this.providers.forEach((p) => p.stopFetchPoolsData());
  }

  async fetchPoolsForToken(
    currency0: Type,
    currency1: Type,
    excludePools?: Set<string>
  ): Promise<void> {
    // ensure that we only fetch the native wrap pools if the token is the native currency and wrapped native currency
    if (currency0.wrapped.equals(currency1.wrapped)) {
      const provider = this.providers.find(
        (p) => p.getType() === LiquidityProviders.NativeWrap
      );

      if (provider) {
        await provider.fetchPoolsForToken(
          currency0.wrapped,
          currency1.wrapped,
          excludePools
        );
      }
    } else {
      const [token0, token1] =
        currency0.wrapped.equals(currency1.wrapped) ||
        currency0.wrapped.sortsBefore(currency1.wrapped)
          ? [currency0.wrapped, currency1.wrapped]
          : [currency1.wrapped, currency0.wrapped];

      await Promise.all(
        this.providers.map((p) =>
          p.fetchPoolsForToken(token0, token1, excludePools)
        )
      );
    }
  }

  getCurrentPoolCodeMap(
    currency0: Type,
    currency1: Type
  ): Map<string, PoolCode> {
    const result: Map<string, PoolCode> = new Map();
    this.providers.forEach((p) => {
      const poolCodes = p.getCurrentPoolList(
        currency0.wrapped,
        currency1.wrapped
      );
      poolCodes.forEach((pc) => result.set(pc.pool.address, pc));
    });

    return result;
  }

  getCurrentPoolCodeList(currency0: Type, currency1: Type): PoolCode[] {
    const pcMap = this.getCurrentPoolCodeMap(
      currency0.wrapped,
      currency1.wrapped
    );
    return Array.from(pcMap.values());
  }

  // returns the last processed by all LP block number
  getLastUpdateBlock(providers?: LiquidityProviders[]): number {
    let lastUpdateBlock: number | undefined;
    this.providers.forEach((p) => {
      if (this._providerIsIncluded(p.getType(), providers)) {
        const last = p.getLastUpdateBlock();
        if (last < 0) return;
        if (lastUpdateBlock === undefined) lastUpdateBlock = last;
        else lastUpdateBlock = Math.min(lastUpdateBlock, last);
      }
    });
    return lastUpdateBlock === undefined ? 0 : lastUpdateBlock;
  }
}
