import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ tableName: "user-details" })
export class UserDetails {
    @PrimaryKey()
    _id!: ObjectId;

    @Property({ unique: true })
    walletAddress!: string;

    @Property()
    ethLastBlock!: string;

    @Property()
    bscLastBlock!: string;

    @Property()
    arbLastBlock!: string;

    @Property({ type: 'json' })
    data!: Record<string, any>;

    @Property({ onCreate: () => new Date() })
    createdAt: Date;

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date;

    constructor(walletAddress: string, ethLastBlock: string, bscLastBlock: string, arbLastBlock: string, data: Record<string, any>) {
        this.walletAddress = walletAddress;
        this.ethLastBlock = ethLastBlock;
        this.bscLastBlock = bscLastBlock;
        this.arbLastBlock = arbLastBlock;
        this.data = data;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}
