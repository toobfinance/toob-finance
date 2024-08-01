import { ChainId } from "../../chain";
import { PublicClient } from "viem";

import { LiquidityProviders } from "./LiquidityProvider";
import { UniswapV2BaseProvider } from "./UniswapV2Base";

export class TraderJoeProvider extends UniswapV2BaseProvider {
  constructor(chainId: ChainId, web3Client: PublicClient) {
    const factory = {
      [ChainId.ARBITRUM_ONE]: "0xaE4EC9901c3076D0DdBe76A520F9E90a6227aCB7",
    } as const;
    const initCodeHash = {
      [ChainId.ARBITRUM_ONE]:
        "0x5c9d12e487d245c53fb0b8dd1ba2ccc48810e6b9671311502b8632e88b0d605b",
    } as const;
    super(chainId, web3Client, factory, initCodeHash);
  }
  getType(): LiquidityProviders {
    return LiquidityProviders.TraderJoe;
  }
  getPoolProviderName(): string {
    return "TraderJoe";
  }
}
