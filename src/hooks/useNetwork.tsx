"use client";

import { ChainId } from "@/packages/chain";
import React, { useState } from "react";

interface NetworkType {
  offWalletChainId: 42161 | 1996 | undefined;
  setOffWalletChainId: any;
}

const defaultVal: NetworkType = {
  offWalletChainId: ChainId.ARBITRUM_ONE,
  setOffWalletChainId: () => {},
};

export const NetworkContext = React.createContext<NetworkType>(defaultVal);

export default function useNetwork() {
  return React.useContext(NetworkContext);
}

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [offWalletChainId, setOffWalletChainId] = useState(
    ChainId.ARBITRUM_ONE
  );

  return (
    <NetworkContext.Provider
      value={{
        offWalletChainId,
        setOffWalletChainId,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
