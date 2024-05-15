import { ChainId } from "../../chain"
import { PublicClient } from "viem"

import { LiquidityProviders } from "./LiquidityProvider"
import { PancakeSwapV3BaseProvider } from "./PancakeSwapV3Base"

export class PancakeSwapV3Provider extends PancakeSwapV3BaseProvider {
  constructor(chainId: ChainId, web3Client: PublicClient) {
    const factory = {
      [ChainId.ARBITRUM_ONE]: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    } as const
    const deployer = {
      [ChainId.ARBITRUM_ONE]: "0x41ff9AA7e16B8B1a8a8dc4f0eFacd93D02d071c9",
    } as const
    const initCodeHash = {
      [ChainId.ARBITRUM_ONE]:
        "0x6ce8eb472fa82df5469c6ab6d485f17c3ad13c8cd7af59b3d4a8026c5ce0f7e2",
    } as const

    const tickLens = {
      [ChainId.ARBITRUM_ONE]: "0x9a489505a00cE272eAa5e07Dba6491314CaE3796",
    } as const
    super(chainId, web3Client, factory, initCodeHash, tickLens, deployer)
  }
  getType(): LiquidityProviders {
    return LiquidityProviders.PancakeSwapV3
  }
  getPoolProviderName(): string {
    return "PancakeSwapV3"
  }
}
