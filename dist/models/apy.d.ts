import { ObjectId } from "@mikro-orm/mongodb";
export declare class Apy {
    _id: ObjectId;
    type: string;
    tokenAddress: string;
    apy: string;
    borrowApy: string;
    rewardApy: string;
    createdAt: Date;
    constructor(type: string, tokenAddress: string, apy: string, borrowApy: string, rewardApy: string);
}
//# sourceMappingURL=apy.d.ts.map