export default [
  {
    chainId: 42161,
    explorers: [
      {
        name: "Arbiscan",
        url: "https://arbiscan.io",
        standard: "EIP3091",
      },
      {
        name: "Arbitrum Explorer",
        url: "https://explorer.arbitrum.io",
        standard: "EIP3091",
      },
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    name: "Arbitrum One",
    shortName: "arb1",
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [
        {
          url: "https://bridge.arbitrum.io",
        },
      ],
    },
  },
] as const;
