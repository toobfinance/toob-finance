import { ChainId } from "../../chain";
import { PublicClient } from "viem";

import { LiquidityProviders } from "./LiquidityProvider";
import { UniswapV3BaseProvider } from "./UniswapV3Base";

export class SushiSwapV3Provider extends UniswapV3BaseProvider {
  constructor(chainId: ChainId, web3Client: PublicClient) {
    const factory = {
      [ChainId.ARBITRUM_ONE]: "0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e",
    } as const;
    const initCodeHash = {
      [ChainId.ARBITRUM_ONE]:
        "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54",
    } as const;

    const tickLens = {
      [ChainId.ARBITRUM_ONE]: "0x8516944E89f296eb6473d79aED1Ba12088016c9e",
    } as const;
    super(chainId, web3Client, factory, initCodeHash, tickLens);
  }
  getType(): LiquidityProviders {
    return LiquidityProviders.SushiSwapV3;
  }
  getPoolProviderName(): string {
    return "SushiSwapV3";
  }
}
