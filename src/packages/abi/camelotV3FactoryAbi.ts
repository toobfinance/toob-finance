export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "_poolDeployer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_vaultAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "newDefaultCommunityFee",
        type: "uint8",
      },
    ],
    name: "DefaultCommunityFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newFarmingAddress",
        type: "address",
      },
    ],
    name: "FarmingAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "alpha1",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "alpha2",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "beta1",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "beta2",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "gamma1",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "gamma2",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "volumeBeta",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "volumeGamma",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "baseFee",
        type: "uint16",
      },
    ],
    name: "FeeConfiguration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "Owner",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "Pool",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newVaultAddress",
        type: "address",
      },
    ],
    name: "VaultAddress",
    type: "event",
  },
  {
    inputs: [],
    name: "baseFeeConfiguration",
    outputs: [
      {
        internalType: "uint16",
        name: "alpha1",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "alpha2",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "beta1",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "beta2",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "gamma1",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "gamma2",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "volumeBeta",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "volumeGamma",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "baseFee",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenB",
        type: "address",
      },
    ],
    name: "createPool",
    outputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "defaultCommunityFee",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "farmingAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "poolByPair",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolDeployer",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "alpha1",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "alpha2",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "beta1",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "beta2",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "gamma1",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "gamma2",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "volumeBeta",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "volumeGamma",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "baseFee",
        type: "uint16",
      },
    ],
    name: "setBaseFeeConfiguration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "newDefaultCommunityFee",
        type: "uint8",
      },
    ],
    name: "setDefaultCommunityFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_farmingAddress",
        type: "address",
      },
    ],
    name: "setFarmingAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_vaultAddress",
        type: "address",
      },
    ],
    name: "setVaultAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
