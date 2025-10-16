import { ObjectId } from "@mikro-orm/mongodb";
export declare class UserDetails {
    _id: ObjectId;
    walletAddress: string;
    ethLastBlock: string;
    bscLastBlock: string;
    arbLastBlock: string;
    data: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    constructor(walletAddress: string, ethLastBlock: string, bscLastBlock: string, arbLastBlock: string, data: Record<string, any>);
}
//# sourceMappingURL=userDetails.d.ts.map