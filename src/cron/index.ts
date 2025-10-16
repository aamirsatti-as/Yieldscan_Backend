import cron from "node-cron";
// import { SUPPORTED_TOKENS_TO_MARKETS } from "../constants";
// import { fetchAndStoreVenusApy } from "../apyHandlers/venus/apyinfo";
// import getCompundApyInfo from "../apyHandlers/compound/apyInfo";
// import getAveApyInfo from "../apyHandlers/avee/apyInfo";
import { MikroORM } from "@mikro-orm/mongodb";
import fetchAndStoreApys from "../apyHandlers";
import { updateAssetsPrice } from "../utils";
// import getRadiantApyInfo from "../apyHandlers/radiant/apyInfo";
// import getFluidApyInfo from "../apyHandlers/fluid/apyInfo";
// import getRocketPoolApyInfo from "../apyHandlers/rocketpool/apyInfo";
// import getLidoApyInfo from "../apyHandlers/lido/apyInfo";
// import getMorphoApyInfo from "../apyHandlers/morpho/apyInfo";

const collectApyData = async (orm: MikroORM) => {
  console.log("Running apy job...");
  // for (const e of Object.keys(SUPPORTED_TOKENS_TO_MARKETS)) {
  // console.log("tokenAddress", e);
  try {
    await fetchAndStoreApys(orm);
    // await getCompundApyInfo(e, orm);
    // await getAveApyInfo(e, orm);
    // await getRadiantApyInfo(e, orm);
    // await fetchAndStoreVenusApy(e, orm);
    // await getFluidApyInfo(e, orm);
    // await getRocketPoolApyInfo(e, orm);
    // await getLidoApyInfo(e, orm);
    // await getMorphoApyInfo(e, orm);
  } catch (error) {
    console.error(`Error collecting APY data:`, error);
  }
  // }
};
const updatePrices = async (orm: MikroORM) => {
  // console.log("Running price update job...");
  try {
    await updateAssetsPrice(orm);
  } catch (error) {
    console.error("Error updating asset prices:", error);
  }
};

const runCron = async (orm: MikroORM) => {
  // Run immediately on startup
  console.log("🚀 Running initial APY collection on startup...");
  // await collectApyData(orm);
  console.log("✅ Initial APY collection completed");

  // Schedule regular updates every 15 minutes
  cron.schedule(process.env.CRON!, async () => {
    await collectApyData(orm);
  });
  cron.schedule("*/15 * * * * *", async () => {
    await updatePrices(orm);
  });
};

export default runCron;
