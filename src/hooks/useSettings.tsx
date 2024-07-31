"use client";

import { ChainId } from "@/packages/chain";
import { TOOB, Type } from "@/packages/currency";
import React, { useState } from "react";

interface SettingsType {
  slippage: number;
  deadline: number;
  setSlippage: any;
  setDeadline: any;
}

const defaultVal: SettingsType = {
  slippage: 0.5,
  deadline: 30,
  setSlippage: () => {},
  setDeadline: () => {},
};

export const SettingsContext = React.createContext<SettingsType>(defaultVal);

export default function useSettings() {
  return React.useContext(SettingsContext);
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(30);

  return (
    <SettingsContext.Provider
      value={{
        slippage,
        deadline,
        setSlippage,
        setDeadline,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
