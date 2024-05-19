import { ChainId } from "@/packages/chain"
import { DEFAULT_TOKEN_LIST } from "@/packages/config"
import { Native, Token } from "@/packages/currency"

const useTokenList = () => {
  const defaultTokens = DEFAULT_TOKEN_LIST.map((item) =>
    item.native || !item.address
      ? Native.onChain(ChainId.ARBITRUM_ONE)
      : new Token({
          chainId: ChainId.ARBITRUM_ONE,
          address: item.address,
          decimals: item.decimals,
          name: item.name,
          symbol: item.symbol,
          icon: item.icon,
          category: item.category,
        })
  )

  return defaultTokens
}

export default useTokenList
