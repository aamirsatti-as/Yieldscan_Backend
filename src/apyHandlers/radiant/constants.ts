const radiantABI = [
  {
    inputs: [{ name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      { name: "availableLiquidity", type: "uint256" },
      { name: "totalStableDebt", type: "uint256" },
      { name: "totalVariableDebt", type: "uint256" },
      { name: "liquidityRate", type: "uint256" },
      { name: "variableBorrowRate", type: "uint256" },
      { name: "stableBorrowRate", type: "uint256" },
      { name: "averageStableBorrowRate", type: "uint256" },
      { name: "liquidityIndex", type: "uint256" },
      { name: "variableBorrowIndex", type: "uint256" },
      { name: "lastUpdateTimestamp", type: "uint40" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// struct ReserveData {
//     ReserveConfigurationMap configuration;
//     uint128 liquidityIndex;
//     uint128 variableBorrowIndex;
//     uint128 currentLiquidityRate;
//     uint128 currentVariableBorrowRate;
//     uint128 currentStableBorrowRate;
//     uint40 lastUpdateTimestamp;
//     address aTokenAddress;
//     address stableDebtTokenAddress;
//     address variableDebtTokenAddress;
//     address interestRateStrategyAddress;
//     uint8 id;
// }

const RADIANT_MARKETS: Record<number, Record<string, string>> = {
  1: {
    ETH: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07",
    USDC: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07",
    USDT: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07",
    WETH: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07",
    WBNB: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07",
    DAI: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07"
  },
  42161: {
    ETH: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886",
    USDC: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886",
    USDT: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886",
    WETH: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886",
    WBNB: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886",
    DAI: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886"
  },
  56: {
    USDC: "0xccf31d54c3a94f67b8ceff8dd771de5846da032c",
    USDT: "0xccf31d54c3a94f67b8ceff8dd771de5846da032c",
    WETH: "0xccf31d54c3a94f67b8ceff8dd771de5846da032c",
    WBNB: "0xccf31d54c3a94f67b8ceff8dd771de5846da032c",
    DAI: "0xccf31d54c3a94f67b8ceff8dd771de5846da032c"
  }
};

const RADIANT_CONTRACTS: Record<number, Record<string, string>> = {
  1: {
    native: "0xf251030DAeA3F09ed7D118F57F4b91F281250527",
    nativeSymbol: "ETH",
    other: "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07"
  },
  42161: {
    native: "0x8a8f65CABb82A857fA22289Ad0a5785a5E7dBD22",
    nativeSymbol: "ETH",
    other: "0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886"
  },
  56: {
    native: "0xD0FC69Dc0e720d5be669E53b7B5015F6FC258Ac9",
    nativeSymbol: "BNB",
    other: "0xccf31d54c3a94f67b8ceff8dd771de5846da032c"
  }
};

export { RADIANT_MARKETS, radiantABI, RADIANT_CONTRACTS };
