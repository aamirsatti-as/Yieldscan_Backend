import type { Options } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { config } from "dotenv";
import { Apy } from "./models/apy";
import { Asset } from "./models/asset";
import { Chain } from './models/chain';
import { Protocol } from './models/protocol';
import { UserDetails } from "./models/userDetails";
import { Definitions } from "./models/definitions";

config();

const MikroOrmConfig: Options<MongoDriver> = {
    dbName: process.env.DB_NAME,
    driver: MongoDriver,
    entities: [Apy, Asset, Chain, Protocol, UserDetails, Definitions],
    entitiesTs: [Apy, Asset, Chain, Protocol, UserDetails, Definitions], // Ensure TypeScript entities are recognized

    clientUrl: process.env.MONGO_URI,
    allowGlobalContext: true,

};
export default MikroOrmConfig;