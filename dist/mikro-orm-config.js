"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("@mikro-orm/mongodb");
const dotenv_1 = require("dotenv");
const apy_1 = require("./models/apy");
const asset_1 = require("./models/asset");
const chain_1 = require("./models/chain");
const protocol_1 = require("./models/protocol");
const userDetails_1 = require("./models/userDetails");
const definitions_1 = require("./models/definitions");
(0, dotenv_1.config)();
const MikroOrmConfig = {
    dbName: process.env.DB_NAME,
    driver: mongodb_1.MongoDriver,
    entities: [apy_1.Apy, asset_1.Asset, chain_1.Chain, protocol_1.Protocol, userDetails_1.UserDetails, definitions_1.Definitions],
    entitiesTs: [apy_1.Apy, asset_1.Asset, chain_1.Chain, protocol_1.Protocol, userDetails_1.UserDetails, definitions_1.Definitions], // Ensure TypeScript entities are recognized
    clientUrl: process.env.MONGO_URI,
    allowGlobalContext: true,
};
exports.default = MikroOrmConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlrcm8tb3JtLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWtyby1vcm0tY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0RBQWlEO0FBQ2pELG1DQUFnQztBQUNoQyxzQ0FBbUM7QUFDbkMsMENBQXVDO0FBQ3ZDLDBDQUF1QztBQUN2QyxnREFBNkM7QUFDN0Msc0RBQW1EO0FBQ25ELHNEQUFtRDtBQUVuRCxJQUFBLGVBQU0sR0FBRSxDQUFDO0FBRVQsTUFBTSxjQUFjLEdBQXlCO0lBQ3pDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU87SUFDM0IsTUFBTSxFQUFFLHFCQUFXO0lBQ25CLFFBQVEsRUFBRSxDQUFDLFNBQUcsRUFBRSxhQUFLLEVBQUUsYUFBSyxFQUFFLG1CQUFRLEVBQUUseUJBQVcsRUFBRSx5QkFBVyxDQUFDO0lBQ2pFLFVBQVUsRUFBRSxDQUFDLFNBQUcsRUFBRSxhQUFLLEVBQUUsYUFBSyxFQUFFLG1CQUFRLEVBQUUseUJBQVcsRUFBRSx5QkFBVyxDQUFDLEVBQUUsNENBQTRDO0lBRWpILFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7SUFDaEMsa0JBQWtCLEVBQUUsSUFBSTtDQUUzQixDQUFDO0FBQ0Ysa0JBQWUsY0FBYyxDQUFDIn0=