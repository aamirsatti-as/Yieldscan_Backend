const aaveABI = [
    {
        inputs: [{ name: 'asset', type: 'address' }],
        name: 'getReserveData',
        outputs: [
            { name: 'availableLiquidity', type: 'uint256' },
            { name: 'totalStableDebt', type: 'uint256' },
            { name: 'totalVariableDebt', type: 'uint256' },
            { name: 'liquidityRate', type: 'uint256' },
            { name: 'variableBorrowRate', type: 'uint256' },
            { name: 'stableBorrowRate', type: 'uint256' },
            { name: 'averageStableBorrowRate', type: 'uint256' },
            { name: 'liquidityIndex', type: 'uint256' },
            { name: 'variableBorrowIndex', type: 'uint256' },
            { name: 'lastUpdateTimestamp', type: 'uint40' }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];


const AVEE_MARKETS: Record<number, Record<string, string>> = {
    1: {
        ETH: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        USDC: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        USDT: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        WETH: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        WBNB: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        DAI: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'
    },
    42161: {
        ETH: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        USDC: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        USDT: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        WETH: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        WBNB: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        DAI: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    },
    56: {
        BNB: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
        USDC: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
        USDT: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
        WETH: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
        WBNB: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
        DAI: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB'
    }
}

const AVEE_CONTRACTS: Record<number, Record<string, string>> = {
    1: {
        native: '0xd01607c3C5eCABa394D8be377a08590149325722',
        nativeSymbol: "ETH",
        other: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    },
    42161: {
        native: '0x5283BEcEd7ADF6D003225C13896E536f2D4264FF',
        nativeSymbol: "ETH",
        other: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    },
    56: {
        native: '0x0c2C95b24529664fE55D4437D7A31175CFE6c4f7',
        nativeSymbol: "BNB",
        other: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
    }
}
export { AVEE_MARKETS, aaveABI, AVEE_CONTRACTS };