import {
  decodeAbiParameters,
  encodeAbiParameters,
  getContractAddress,
  keccak256,
  parseAbiParameters,
} from "viem"
import { Token } from "../../currency"

import { FeeAmount } from "../constants"

/**
 * Computes a pool address
 * @param factoryAddress The Uniswap V3 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pool address
 */
export function computePoolAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: Token | string
  tokenB: Token | string
  fee: number
  initCodeHashManualOverride: string
}): string {
  if (typeof tokenA !== "string" && typeof tokenB !== "string") {
    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA] // does safety checks
    return getContractAddress({
      from: factoryAddress as `0x${string}`,
      bytecodeHash: initCodeHashManualOverride as `0x${string}`,
      salt: keccak256(
        encodeAbiParameters(parseAbiParameters("address, address, uint24"), [
          token0.address,
          token1.address,
          fee,
        ])
      ),
      opcode: "CREATE2",
    })
  }

  return getContractAddress({
    from: factoryAddress as `0x${string}`,
    bytecodeHash: initCodeHashManualOverride as `0x${string}`,
    salt: keccak256(
      encodeAbiParameters(parseAbiParameters("address, address, uint24"), [
        tokenA as `0x${string}`,
        tokenB as `0x${string}`,
        fee,
      ])
    ),
    opcode: "CREATE2",
  })
}
