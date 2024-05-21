export default [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "targetData", type: "bytes" },
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
        ],
        internalType: "struct ToobFinanceAggregator.SwapParams",
        name: "param",
        type: "tuple",
      },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const
