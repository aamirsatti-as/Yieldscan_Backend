"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const apyHandlers_1 = __importDefault(require("../apyHandlers"));
const utils_1 = require("../utils");
// import getRadiantApyInfo from "../apyHandlers/radiant/apyInfo";
// import getFluidApyInfo from "../apyHandlers/fluid/apyInfo";
// import getRocketPoolApyInfo from "../apyHandlers/rocketpool/apyInfo";
// import getLidoApyInfo from "../apyHandlers/lido/apyInfo";
// import getMorphoApyInfo from "../apyHandlers/morpho/apyInfo";
const collectApyData = async (orm) => {
    console.log("Running apy job...");
    // for (const e of Object.keys(SUPPORTED_TOKENS_TO_MARKETS)) {
    // console.log("tokenAddress", e);
    try {
        await (0, apyHandlers_1.default)(orm);
        // await getCompundApyInfo(e, orm);
        // await getAveApyInfo(e, orm);
        // await getRadiantApyInfo(e, orm);
        // await fetchAndStoreVenusApy(e, orm);
        // await getFluidApyInfo(e, orm);
        // await getRocketPoolApyInfo(e, orm);
        // await getLidoApyInfo(e, orm);
        // await getMorphoApyInfo(e, orm);
    }
    catch (error) {
        console.error(`Error collecting APY data:`, error);
    }
    // }
};
const updatePrices = async (orm) => {
    // console.log("Running price update job...");
    try {
        await (0, utils_1.updateAssetsPrice)(orm);
    }
    catch (error) {
        console.error("Error updating asset prices:", error);
    }
};
const runCron = async (orm) => {
    // Run immediately on startup
    console.log("🚀 Running initial APY collection on startup...");
    // await collectApyData(orm);
    console.log("✅ Initial APY collection completed");
    // Schedule regular updates every 15 minutes
    node_cron_1.default.schedule(process.env.CRON, async () => {
        await collectApyData(orm);
    });
    node_cron_1.default.schedule("*/15 * * * * *", async () => {
        await updatePrices(orm);
    });
};
exports.default = runCron;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3Jvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDBEQUE2QjtBQU03QixpRUFBK0M7QUFDL0Msb0NBQTZDO0FBQzdDLGtFQUFrRTtBQUNsRSw4REFBOEQ7QUFDOUQsd0VBQXdFO0FBQ3hFLDREQUE0RDtBQUM1RCxnRUFBZ0U7QUFFaEUsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLEdBQWEsRUFBRSxFQUFFO0lBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNsQyw4REFBOEQ7SUFDOUQsa0NBQWtDO0lBQ2xDLElBQUksQ0FBQztRQUNILE1BQU0sSUFBQSxxQkFBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixtQ0FBbUM7UUFDbkMsK0JBQStCO1FBQy9CLG1DQUFtQztRQUNuQyx1Q0FBdUM7UUFDdkMsaUNBQWlDO1FBQ2pDLHNDQUFzQztRQUN0QyxnQ0FBZ0M7UUFDaEMsa0NBQWtDO0lBQ3BDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsSUFBSTtBQUNOLENBQUMsQ0FBQztBQUNGLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxHQUFhLEVBQUUsRUFBRTtJQUMzQyw4Q0FBOEM7SUFDOUMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxJQUFBLHlCQUFpQixFQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEdBQWEsRUFBRSxFQUFFO0lBQ3RDLDZCQUE2QjtJQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDL0QsNkJBQTZCO0lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUVsRCw0Q0FBNEM7SUFDNUMsbUJBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDMUMsTUFBTSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDSCxtQkFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN6QyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLGtCQUFlLE9BQU8sQ0FBQyJ9