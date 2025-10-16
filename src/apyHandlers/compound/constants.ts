const compoundV3ABI = [
    {
        inputs: [],
        name: 'getUtilization',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'utilization', type: 'uint256' }],
        name: 'getSupplyRate',
        outputs: [{ name: '', type: 'uint64' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'utilization', type: 'uint256' }],
        name: 'getBorrowRate',
        outputs: [{ name: '', type: 'uint64' }],
        stateMutability: 'view',
        type: 'function'
    }
];

const COMPOUND_V3_MARKETS: Record<number, Record<string, string>> = {
    1: {
        ETH: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        USDC: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        WETH: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        USDT: '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840'
    },
    42161: {
        ETH: '0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486',
        USDC: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
        USDT: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07'
    }
};

export { compoundV3ABI, COMPOUND_V3_MARKETS };