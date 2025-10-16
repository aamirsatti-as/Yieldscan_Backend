import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ tableName: "apy" })
export class Apy {
    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    type!: string;

    @Property()
    tokenAddress!: string;

    @Property()
    apy!: string;

    @Property()
    borrowApy!: string;

    @Property()
    rewardApy!: string;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    constructor(type: string, tokenAddress: string, apy: string, borrowApy: string, rewardApy: string) {
        this.type = type;
        this.tokenAddress = tokenAddress;
        this.apy = apy;
        this.borrowApy = borrowApy;
        this.rewardApy = rewardApy;
    }
}
