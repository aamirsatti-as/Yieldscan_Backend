// @ts-nocheck
import { ethers } from "ethers";
import { Apy } from "../models/apy";
import { MikroORM } from "@mikro-orm/mongodb";
import { aprToApy } from "../utils";
import { Asset } from "../models/asset";
import { Definitions } from "../models/definitions";
import axios from "axios";

async function fetchAndStoreApys(orm: MikroORM) {
    const em = orm.em.fork();

    // Get all assets with definitions
    const assets = await em.find(Asset, {}, { populate: ["chain"] });

    for (const asset of assets) {
        const definitions = await em.find(Definitions, { asset }, { populate: ['protocol'] });

        for (const definition of definitions) {

            if (!definition) continue;

            try {
                if (definition.protocol.name === "Fluid") {
                    console.log(definition.apy);
                }

                const fn = new Function(
                    "ethers", // parameter name
                    `return ${definition.apy}` // your DB string (must be a function expression)
                )();

                if (definition.protocol.name === "Fluid") {
                    console.log("function", fn.toString());
                }


                const result = await fn(definition.protocol.name === "Fluid" ? axios : ethers);

                console.log(definition.protocol.name, asset.address, asset.symbol, "APY:", result.apy, "Borrow APY:", result.borrowApy, "Reward APY:", result.rewardApy);

                // Try to find existing APY record
                let apyEntity = await em.findOne(Apy, {
                    type: definition.protocol.name,
                    tokenAddress: new RegExp(asset.address, "i")
                });

                if (Number(result.apy) > 0) {
                    if (apyEntity) {
                        // Update existing
                        apyEntity.apy = result.apy ?? "0";
                        apyEntity.borrowApy = result.borrowApy ?? "0";
                        apyEntity.rewardApy = result.rewardApy ?? "0";
                    } else {
                        // Insert new
                        apyEntity = new Apy(
                            definition.protocol.name,
                            asset.address,
                            result.apy ?? "0",
                            result.borrowApy ?? "0",
                            result.rewardApy ?? "0"
                        );
                        em.persist(apyEntity);
                    }
                    await em.flush();
                }
            } catch (err) {
                console.error(`Error fetching APY for ${asset.symbol}, protocol ${definition.protocol.name}:`, err);
            }
        }

    }

    await em.flush();
    console.log("APYs updated ✅");
}

export default fetchAndStoreApys