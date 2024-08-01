import { ChainId } from "../../chain";
import { PublicClient } from "viem";

import { LiquidityProviders } from "./LiquidityProvider";
import { UniswapV2BaseProvider } from "./UniswapV2Base";

export class CamelotSwapV2Provider extends UniswapV2BaseProvider {
  constructor(chainId: ChainId, web3Client: PublicClient) {
    const factory = {
      [ChainId.ARBITRUM_ONE]: "0x6EcCab422D763aC031210895C81787E87B43A652",
      [ChainId.SANKO_MAINNET]: "0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4",
    } as const;

    const initCodeHash = {
      [ChainId.ARBITRUM_ONE]:
        "0xa856464ae65f7619087bc369daaf7e387dae1e5af69cfa7935850ebf754b04c1",
      [ChainId.SANKO_MAINNET]:
        "0xd01dcfe13dff3376919d2743b3155c817452bcf4154817ee6096bbc9f7ea37ab",
    } as const;

    super(chainId, web3Client, factory, initCodeHash);
  }
  getType(): LiquidityProviders {
    return LiquidityProviders.CamelotSwapV2;
  }
  getPoolProviderName(): string {
    return "CamelotSwapV2";
  }
}
