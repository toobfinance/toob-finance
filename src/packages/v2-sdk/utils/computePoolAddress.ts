import { Address, getContractAddress, keccak256, encodePacked } from "viem"
import { Token } from "../../currency"
import invariant from "tiny-invariant"

/**
 * Computes a pair address
 * @param factoryAddress The Uniswap V2 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pair address
 */
export const computePoolAddress = ({
  factoryAddress,
  tokenA,
  tokenB,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: Token
  tokenB: Token
  initCodeHashManualOverride: string
}): string => {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA] // does safety checks
  invariant(token0.chainId === token1.chainId, "CHAIN_ID")
  return getContractAddress({
    opcode: "CREATE2",
    bytecodeHash: initCodeHashManualOverride as `0x${string}`,
    from: factoryAddress as Address,
    salt: keccak256(
      encodePacked(["address", "address"], [token0.address, token1.address])
    ),
  })
}
