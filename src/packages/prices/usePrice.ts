import { useQuery } from "@tanstack/react-query"
import { Fraction } from "../math"
import { parseUnits } from "viem"
import { ChainId } from "../chain"

const COINGECKO_TERMINAL_CHAIN_ID: { [chainId in ChainId]: string } = {
  [ChainId.ARBITRUM_ONE]: "arbitrum",
}

interface UsePrice {
  chainId: ChainId | undefined
  address: string | undefined
}

export const usePrice = ({ chainId, address }: UsePrice) => {
  return useQuery({
    queryKey: [
      chainId &&
        `https://api.geckoterminal.com/api/v2/networks/${COINGECKO_TERMINAL_CHAIN_ID[chainId]}/tokens/${address}`,
    ],
    queryFn: async () => {
      if (!chainId) return new Fraction(0, 1)
      const data = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/${COINGECKO_TERMINAL_CHAIN_ID[chainId]}/tokens/${address}`
      ).then((response) => response.json())
      return new Fraction(
        parseUnits(
          parseFloat(data?.data?.attributes?.price_usd ?? "0").toFixed(18),
          18
        ).toString(),
        parseUnits("1", 18).toString()
      )
    },
    enabled: Boolean(chainId && address),
    staleTime: 900000, // 15 mins
    refetchOnWindowFocus: false,
  })
}
