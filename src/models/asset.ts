import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Chain } from "./chain";

@Entity({ tableName: "assets" })
export class Asset {
    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    symbol!: string;

    @Property()
    image!: string;

    @Property()
    address!: string;

    @Property()
    decimals!: number;
    
    @ManyToOne(() => Chain)
    chain!: Chain; // ✅ asset only belongs to a chain, not directly to protocol

    @Property({ default: 0 })
    usdPrice: number;

    @Property()
    maxDecimalsShow: number;

    constructor(symbol: string, image: string, address: string, chain: Chain, decimals: number, maxDecimalsShow: number) {
        this.symbol = symbol;
        this.image = image;
        this.address = address;
        this.decimals = decimals;
        this.maxDecimalsShow = maxDecimalsShow;
        this.chain = chain;
    }
}
