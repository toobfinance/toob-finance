"use client";

import { ChainId } from "@/packages/chain";
import { Native, Type } from "@/packages/currency";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useNetwork from "./useNetwork";

interface SwapParamsType {
  amountIn: string;
  amountOut: string;
  tokenIn?: Type;
  tokenOut?: Type;
  setTokenIn: any;
  setTokenOut: any;
  setAmountIn: any;
  setAmountOut: any;
  switchToken: any;
}

const defaultVal: SwapParamsType = {
  tokenIn: Native.onChain(ChainId.ARBITRUM_ONE),
  tokenOut: undefined,
  amountIn: "",
  amountOut: "",
  setTokenIn: () => {},
  setTokenOut: () => {},
  setAmountIn: () => {},
  setAmountOut: () => {},
  switchToken: () => {},
};

export const SwapParamsContext =
  React.createContext<SwapParamsType>(defaultVal);

export default function useSwapParams() {
  return React.useContext(SwapParamsContext);
}

export const SwapParamsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const { chainId } = useAccount();
  const { offWalletChainId, setOffWalletChainId } = useNetwork();

  let connectedChainId =
    chainId === ChainId.ARBITRUM_ONE
      ? ChainId.ARBITRUM_ONE
      : chainId === ChainId.SANKO_MAINNET
      ? ChainId.SANKO_MAINNET
      : undefined;
  if (connectedChainId == undefined) {
    connectedChainId = offWalletChainId;
  } else {
    setOffWalletChainId(connectedChainId);
  }

  if (connectedChainId === undefined) {
    connectedChainId = ChainId.ARBITRUM_ONE;
  }

  useEffect(() => {
    if (connectedChainId) {
      setTokenIn(Native.onChain(connectedChainId));
      setAmountIn("");
      setAmountOut("");
      setTokenOut(undefined);
    } else {
      setTokenIn(Native.onChain(ChainId.ARBITRUM_ONE));
      setAmountIn("");
      setAmountOut("");
      setTokenOut(undefined);
    }
  }, [connectedChainId]);

  const [tokenIn, setTokenIn] = useState<Type | undefined>(
    Native.onChain(connectedChainId)
  );
  const [tokenOut, setTokenOut] = useState<Type | undefined>();

  const switchToken = () => {
    const newTokenIn = tokenOut;
    const newTokenOut = tokenIn;

    setAmountIn("0");
    setTokenIn(newTokenIn);
    setTokenOut(newTokenOut);
  };

  const _setTokenIn = (token: Type) => {
    if (tokenOut?.equals(token)) {
      setTokenOut(tokenIn);
    }
    setTokenIn(token);
  };

  const _setTokenOut = (token: Type) => {
    if (tokenIn?.equals(token)) {
      setTokenIn(tokenOut);
    }
    setTokenOut(token);
  };

  return (
    <SwapParamsContext.Provider
      value={{
        amountIn,
        amountOut,
        tokenIn,
        tokenOut,
        setTokenIn: _setTokenIn,
        setTokenOut: _setTokenOut,
        setAmountIn,
        setAmountOut,
        switchToken,
      }}
    >
      {children}
    </SwapParamsContext.Provider>
  );
};
