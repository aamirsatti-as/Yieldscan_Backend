import { ObjectId } from "@mikro-orm/mongodb";
import { Chain } from "./chain";
export declare class Asset {
    _id: ObjectId;
    symbol: string;
    image: string;
    address: string;
    decimals: number;
    chain: Chain;
    usdPrice: number;
    maxDecimalsShow: number;
    constructor(symbol: string, image: string, address: string, chain: Chain, decimals: number, maxDecimalsShow: number);
}
//# sourceMappingURL=asset.d.ts.map