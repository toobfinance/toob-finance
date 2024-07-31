"use client";

import { ChainId } from "../packages/chain";
import { Amount, Token } from "../packages/currency";
import { useReadContract } from "wagmi";
import { erc20Abi, Address } from "viem";

interface UseTokenAllowance {
  token?: Token;
  chainId: ChainId | undefined;
  owner: Address | undefined;
  spender: Address | undefined;
  enabled?: boolean;
}

export const useTokenAllowance = ({
  chainId,
  token,
  owner,
  spender,
  enabled = true,
}: UseTokenAllowance) => {
  return useReadContract({
    chainId,
    address: token ? (token.address as Address) : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner as Address, spender as Address],
    query: {
      enabled: Boolean(token && owner && spender && enabled && chainId),
      select: (data) => {
        if (token) {
          return Amount.fromRawAmount(token, data.toString());
        }
      },
    },
  });
};
