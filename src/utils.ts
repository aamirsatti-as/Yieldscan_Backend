import axios from "axios";
import { Asset } from "./models/asset";
import { MikroORM } from "@mikro-orm/mongodb";

// Convert APR to APY
export const aprToApy = (rate: number) => (Math.pow(1 + rate / 365, 365) - 1) * 100;

export const updateAssetsPrice = async (orm: MikroORM) => {
    const em = orm.em.fork();
    const assets = await em.find(Asset, {});

    if (assets.length === 0) return;

    const symbols = [...new Set(assets.map(a => a.symbol.toLowerCase()))];

    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&symbols=${symbols.join(",")}`;
    const { data } = await axios.get(url);

    for (const asset of assets) {
        const symbolKeyL = asset.symbol.toLowerCase();
        const symbolKeyU = asset.symbol.toUpperCase();
        if (data[symbolKeyL] && data[symbolKeyL].usd !== undefined) {
            asset.usdPrice = data[symbolKeyL].usd;
        }
        else if (data[symbolKeyU] && data[symbolKeyU].usd !== undefined) {
            asset.usdPrice = data[symbolKeyU].usd;
        }
        else {
            console.warn(`No price found for symbol: ${asset.symbol}`);
        }
    }
    await em.flush();
};
