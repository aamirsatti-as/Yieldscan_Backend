"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetsPrice = exports.aprToApy = void 0;
const axios_1 = __importDefault(require("axios"));
const asset_1 = require("./models/asset");
// Convert APR to APY
const aprToApy = (rate) => (Math.pow(1 + rate / 365, 365) - 1) * 100;
exports.aprToApy = aprToApy;
const updateAssetsPrice = async (orm) => {
    const em = orm.em.fork();
    const assets = await em.find(asset_1.Asset, {});
    if (assets.length === 0)
        return;
    const symbols = [...new Set(assets.map(a => a.symbol.toLowerCase()))];
    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&symbols=${symbols.join(",")}`;
    const { data } = await axios_1.default.get(url);
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
exports.updateAssetsPrice = updateAssetsPrice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLDBDQUF1QztBQUd2QyxxQkFBcUI7QUFDZCxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUF2RSxRQUFBLFFBQVEsWUFBK0Q7QUFFN0UsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFDckQsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXhDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTztJQUVoQyxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdEUsTUFBTSxHQUFHLEdBQUcsMkVBQTJFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUMzRyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXRDLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7UUFDekIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5QyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDekQsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzFDLENBQUM7YUFDSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzlELEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMxQyxDQUFDO2FBQ0ksQ0FBQztZQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckIsQ0FBQyxDQUFDO0FBekJXLFFBQUEsaUJBQWlCLHFCQXlCNUIifQ==