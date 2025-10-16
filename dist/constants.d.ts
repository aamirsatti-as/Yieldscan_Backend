declare const SECONDS_PER_YEAR = 31536000;
declare const CHAIN_ID_TO_NAME: Record<number, string>;
declare const SIMILAR_TOKENS_AND_CURRENY: Record<string, string>;
declare const SUPPORTED_TOKENS_TO_MARKETS: Record<string, {
    chainId: number;
    market: string;
}>;
declare const RPC_URLS: Record<number, string>;
declare const API_URLS: Record<number, {
    apiUrl: string;
    apiKey: string;
}>;
declare const WALLET_ADDRESS = "0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6";
export { SECONDS_PER_YEAR, CHAIN_ID_TO_NAME, SIMILAR_TOKENS_AND_CURRENY, SUPPORTED_TOKENS_TO_MARKETS, RPC_URLS, API_URLS, WALLET_ADDRESS };
export declare const protocols: {
    _id: {
        $oid: string;
    };
    name: string;
    website: string;
    image: string;
}[];
export declare const definitions: {
    _id: {
        $oid: string;
    };
    asset: {
        $oid: string;
    };
    protocol: {
        $oid: string;
    };
    apy: string;
    withdraw: string;
    deposit: string;
    underlyingAsset: string;
    withdrawContract: string;
    withdrawUri: string;
    yieldBearingToken: string;
}[];
//# sourceMappingURL=constants.d.ts.map