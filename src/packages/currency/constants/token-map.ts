import { AddressMapper } from "../AddressMapper"
import {
  ARB_ADDRESS,
  DAI_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS,
  WBTC_ADDRESS,
  WETH9_ADDRESS,
  // WNATIVE_ADDRESS,
} from "./token-addresses"

const MERGED_USDC_ADDRESS = AddressMapper.merge(USDC_ADDRESS)

const MERGED_USDT_ADDRESS = AddressMapper.merge(USDT_ADDRESS)

const MERGED_WETH_ADDRESS = AddressMapper.merge(WETH9_ADDRESS)

export const TOKEN_MAP = AddressMapper.generate([
  ARB_ADDRESS,
  DAI_ADDRESS,
  MERGED_USDC_ADDRESS,
  MERGED_USDT_ADDRESS,
  MERGED_WETH_ADDRESS,
  WBTC_ADDRESS,
])
