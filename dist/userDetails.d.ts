import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
export declare function getUserTransactions(em: EntityManager<IDatabaseDriver<Connection>>, walletAddress: string, progressMap: Map<string, any>, requestId: string): Promise<{
    [walletAddress: string]: {
        [chainId: string]: {
            [protocol: string]: {
                [tokenSymbol: string]: {
                    totalDeposit: number;
                    totalWithdraw: number;
                };
            };
        };
    };
}>;
//# sourceMappingURL=userDetails.d.ts.map