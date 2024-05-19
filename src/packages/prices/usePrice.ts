import { useQuery } from "@tanstack/react-query"
import { Fraction } from "../math"
import { parseUnits } from "viem"
import { ChainId } from "../chain"
import axios from "axios"

interface UsePrice {
  chainId: ChainId | undefined
  address: string | undefined
  enabled?: boolean
}

export const usePrice = ({ chainId, address, enabled }: UsePrice) => {
  return useQuery({
    queryKey: [chainId, address],
    queryFn: async () => {
      if (!chainId) return new Fraction(0, 1)
      const { data } = await axios.get(
        `https://api.odos.xyz/pricing/token/${chainId}/${address}`
      )
      return data?.price ?? 0
    },
    enabled: Boolean(chainId && address) && Boolean(enabled),
    staleTime: 900000, // 15 mins
    refetchOnWindowFocus: false,
  })
}
