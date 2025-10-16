import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ tableName: "chains" })
export class Chain {
    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    name!: string;

    @Property({ unique: true })
    chainId!: number;

    @Property()
    image!: string;

    constructor(
        name: string,
        chainId: number,
        image: string,
    ) {
        this.name = name;
        this.chainId = chainId;
        this.image = image;
    }
}
