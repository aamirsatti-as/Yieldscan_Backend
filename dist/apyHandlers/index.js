"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const ethers_1 = require("ethers");
const apy_1 = require("../models/apy");
const asset_1 = require("../models/asset");
const definitions_1 = require("../models/definitions");
const axios_1 = __importDefault(require("axios"));
async function fetchAndStoreApys(orm) {
    const em = orm.em.fork();
    // Get all assets with definitions
    const assets = await em.find(asset_1.Asset, {}, { populate: ["chain"] });
    for (const asset of assets) {
        const definitions = await em.find(definitions_1.Definitions, { asset }, { populate: ['protocol'] });
        for (const definition of definitions) {
            if (!definition)
                continue;
            try {
                if (definition.protocol.name === "Fluid") {
                    console.log(definition.apy);
                }
                const fn = new Function("ethers", // parameter name
                `return ${definition.apy}` // your DB string (must be a function expression)
                )();
                if (definition.protocol.name === "Fluid") {
                    console.log("function", fn.toString());
                }
                const result = await fn(definition.protocol.name === "Fluid" ? axios_1.default : ethers_1.ethers);
                console.log(definition.protocol.name, asset.address, asset.symbol, "APY:", result.apy, "Borrow APY:", result.borrowApy, "Reward APY:", result.rewardApy);
                // Try to find existing APY record
                let apyEntity = await em.findOne(apy_1.Apy, {
                    type: definition.protocol.name,
                    tokenAddress: new RegExp(asset.address, "i")
                });
                if (Number(result.apy) > 0) {
                    if (apyEntity) {
                        // Update existing
                        apyEntity.apy = result.apy ?? "0";
                        apyEntity.borrowApy = result.borrowApy ?? "0";
                        apyEntity.rewardApy = result.rewardApy ?? "0";
                    }
                    else {
                        // Insert new
                        apyEntity = new apy_1.Apy(definition.protocol.name, asset.address, result.apy ?? "0", result.borrowApy ?? "0", result.rewardApy ?? "0");
                        em.persist(apyEntity);
                    }
                    await em.flush();
                }
            }
            catch (err) {
                console.error(`Error fetching APY for ${asset.symbol}, protocol ${definition.protocol.name}:`, err);
            }
        }
    }
    await em.flush();
    console.log("APYs updated ✅");
}
exports.default = fetchAndStoreApys;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXB5SGFuZGxlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxjQUFjO0FBQ2QsbUNBQWdDO0FBQ2hDLHVDQUFvQztBQUdwQywyQ0FBd0M7QUFDeEMsdURBQW9EO0FBQ3BELGtEQUEwQjtBQUUxQixLQUFLLFVBQVUsaUJBQWlCLENBQUMsR0FBYTtJQUMxQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXpCLGtDQUFrQztJQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVqRSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdEYsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUVuQyxJQUFJLENBQUMsVUFBVTtnQkFBRSxTQUFTO1lBRTFCLElBQUksQ0FBQztnQkFDRCxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO29CQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztnQkFFRCxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FDbkIsUUFBUSxFQUFFLGlCQUFpQjtnQkFDM0IsVUFBVSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsaURBQWlEO2lCQUMvRSxFQUFFLENBQUM7Z0JBRUos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