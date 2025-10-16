import { ObjectId } from "@mikro-orm/mongodb";
export declare class Protocol {
    _id: ObjectId;
    name: string;
    website?: string;
    image: string;
    constructor(name: string, image: string, website?: string);
}
//# sourceMappingURL=protocol.d.ts.map