import { ObjectId } from "@mikro-orm/mongodb";
import { Asset } from "./asset";
import { Protocol } from "./protocol";
export declare class Definitions {
    _id: ObjectId;
    asset: Asset;
    protocol: Protocol;
    apy: string;
    withdraw: string;
    deposit: string;
    underlyingAsset: string;
    yieldBearingToken: string;
    withdrawContract: string;
    withdrawUri: string;
    constructor(asset: Asset, protocol: Protocol, apy: string, withdraw: string, deposit: string, underlyingAsset: string, yieldBearingToken: string, withdrawContract: string, withdrawUri: string);
}
//# sourceMappingURL=definitions.d.ts.map