import { Token } from "../Token"

export function addressMapToTokenMap(
  {
    decimals,
    symbol,
    name,
    icon,
  }: {
    decimals: number | string
    symbol?: string | undefined
    name?: string | undefined
    icon?: string | undefined
  },
  map: Record<number | string, string>
) {
  return Object.fromEntries(
    Object.entries(map).map(([chainId, address]) => [
      chainId,
      new Token({
        chainId,
        address,
        decimals,
        symbol,
        name,
        icon,
      }),
    ])
  )
}
