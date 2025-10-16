import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ tableName: "protocols" })
export class Protocol {
    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    name!: string;

    @Property({ nullable: true })
    website?: string;

    @Property()
    image!: string;

    constructor(name: string, image: string, website?: string) {
        this.name = name;
        this.image = image;
        this.website = website;
    }
}
