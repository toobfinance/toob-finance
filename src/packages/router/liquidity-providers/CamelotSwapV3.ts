import { ChainId } from "../../chain";
import { PublicClient } from "viem";

import { LiquidityProviders } from "./LiquidityProvider";
import { AlgebraBaseProvider } from "./AlgebraBase";
import { FeeAmount } from "../../v3-sdk";
import ABI from "../abis/CamelotV3Pair";

export class CamelotSwapV3Provider extends AlgebraBaseProvider {
  constructor(chainId: ChainId, web3Client: PublicClient) {
    const factory = {
      // [ChainId.ARBITRUM_ONE]: "0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B",
      [ChainId.SANKO_MAINNET]: "0xcF8d0723e69c6215523253a190eB9Bc3f68E0FFa",
    } as const;

    const deployer = {
      // [ChainId.ARBITRUM_ONE]: "0x6Dd3FB9653B10e806650F107C3B5A0a6fF974F65",
      [ChainId.SANKO_MAINNET]: "0x10aa510d94e094bd643677bd2964c3ee085daffc",
    } as const;

    const initCodeHash = {
      // [ChainId.ARBITRUM_ONE]:
      //   "0x6c1bebd370ba84753516bc1393c0d0a6c645856da55f5393ac8ab3d6dbc861d3",
      [ChainId.SANKO_MAINNET]:
        "0x6c1bebd370ba84753516bc1393c0d0a6c645856da55f5393ac8ab3d6dbc861d3",
    } as const;

    const tickLens = {
      // [ChainId.ARBITRUM_ONE]: "0x3e8e3ec2a797d12b96da4ad0b86cc1e7b75a6bb1",
      [ChainId.SANKO_MAINNET]: "0x0000000000000000000000000000000000000000000", // No tick lens
    } as const;
    super(
      chainId,
      web3Client,
      factory,
      deployer,
      initCodeHash,
      tickLens,
      FeeAmount.LOWEST,
      ABI
    );
  }
  getType(): LiquidityProviders {
    return LiquidityProviders.CamelotSwapV3;
  }
  getPoolProviderName(): string {
    return "CamelotSwapV3";
  }
}
