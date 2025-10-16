"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const apy_1 = require("../../models/apy");
const constants_1 = require("../../constants");
const ROCKETPOOL_API_URL = "https://stake.rocketpool.net/api/mainnet/payload";
const getRocketPoolApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_1.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }
    // Only support Ethereum ETH/WETH tokens
    if (marketInfo.chainId !== 1) {
        return 'Rocket Pool only supported on Ethereum';
    }
    // Only support ETH-related tokens
    if (marketInfo.market !== "ETH" && marketInfo.market !== "WETH") {
        return 'Rocket Pool only supports ETH/WETH tokens';
    }
    try {
        // Fetch data from Rocket Pool API
        const response = await axios_1.default.get(ROCKETPOOL_API_URL);
        const data = response.data;
        if (!data || !data.rethAPR) {
            console.log('Rocket Pool API response missing rethAPR data');
            return 'No rETH APR data available';
        }
        // Extract rETH APR (already in percentage format)
        const rethApr = parseFloat(data.rethAPR);
        // Get beacon chain APR for comparison (base staking rate)
        const beaconChainApr = parseFloat(data.beaconChainAPR || 0) * 100; // Convert to percentage
        // rETH APR is the total staking yield (includes MEV, tips, etc.)
        const totalApy = rethApr;
        // Create and save APY record
        const apy = new apy_1.Apy("RocketPool", tokenAddress, totalApy.toFixed(2), "0", // No borrow APY for staking
        "0" // No separate reward APY (included in total)
        );
        await orm.em.persistAndFlush(apy);
        console.log(`Rocket Pool APY saved for ${marketInfo.market}: ${totalApy.toFixed(2)}% (rETH staking APR)`);
        return {
            apy: totalApy,
            rethApr: rethApr,
            beaconChainApr: beaconChainApr,
            tokenSymbol: marketInfo.market
        };
    }
    catch (err) {
        console.error('Rocket Pool Error fetching APY:', err.message);
        return err.message || 'Internal error';
    }
};
exports.default = getRocketPoolApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9yb2NrZXRwb29sL2FweUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsMENBQXVDO0FBRXZDLCtDQUE4RDtBQUU5RCxNQUFNLGtCQUFrQixHQUFHLGtEQUFrRCxDQUFDO0FBRTlFLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLFlBQW9CLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFDdkUsTUFBTSxVQUFVLEdBQUcsdUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2QsT0FBTywyQkFBMkIsQ0FBQztJQUN2QyxDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLElBQUksVUFBVSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMzQixPQUFPLHdDQUF3QyxDQUFDO0lBQ3BELENBQUM7SUFFRCxrQ0FBa0M7SUFDbEMsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLEtBQUssSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQzlELE9BQU8sMkNBQTJDLENBQUM7SUFDdkQsQ0FBQztJQUVELElBQUksQ0FBQztRQUNELGtDQUFrQztRQUNsQyxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBRTNCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1lBQzdELE9BQU8sNEJBQTRCLENBQUM7UUFDeEMsQ0FBQztRQUVELGtEQUFrRDtRQUNsRCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLDBEQUEwRDtRQUMxRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyx3QkFBd0I7UUFFM0YsaUVBQWlFO1FBQ2pFLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUV6Qiw2QkFBNkI7UUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxTQUFHLENBQ2YsWUFBWSxFQUNaLFlBQVksRUFDWixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUNuQixHQUFHLEVBQUUsNEJBQTRCO1FBQ2pDLEdBQUcsQ0FBRSw2Q0FBNkM7U0FDckQsQ0FBQztRQUVGLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsVUFBVSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRTFHLE9BQU87WUFDSCxHQUFHLEVBQUUsUUFBUTtZQUNiLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGNBQWMsRUFBRSxjQUFjO1lBQzlCLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTTtTQUNqQyxDQUFDO0lBRU4sQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsT0FBTyxHQUFHLENBQUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDO0lBQzNDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixrQkFBZSxvQkFBb0IsQ0FBQyJ9