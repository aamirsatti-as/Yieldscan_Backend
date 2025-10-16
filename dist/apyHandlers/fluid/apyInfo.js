"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const apy_1 = require("../../models/apy");
const constants_1 = require("../../constants");
const getFluidApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_1.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }
    // Only support Ethereum and Arbitrum for now
    if (marketInfo.chainId !== 1 && marketInfo.chainId !== 42161) {
        return 'Fluid not supported on this chain';
    }
    try {
        // Fetch data from Fluid API for the specific chain
        const apiUrl = `https://api.fluid.instadapp.io/v2/lending/${marketInfo.chainId}/users/${constants_1.WALLET_ADDRESS}/positions`;
        const response = await axios_1.default.get(apiUrl);
        const pools = response.data?.data || [];
        // Find the pool for this token
        const pool = pools.find((p) => {
            const assetAddress = p.token?.assetAddress?.toLowerCase();
            const targetAddress = tokenAddress.toLowerCase();
            return assetAddress === targetAddress;
        });
        if (!pool) {
            console.log(`Fluid pool not found for token: ${tokenAddress} on chain ${marketInfo.chainId}`);
            return 'Fluid pool not found for this token';
        }
        // Extract lending APR (in basis points)
        const lendingApr = pool.token.supplyRate ? parseFloat(pool.token.supplyRate) / 100 : 0;
        // Extract reward APR (in basis points) 
        // For Arbitrum, check rewardsRate field first, then fall back to rewards array
        let rewardApr = 0;
        if (pool.token.rewardsRate && parseFloat(pool.token.rewardsRate) > 0) {
            rewardApr = parseFloat(pool.token.rewardsRate) / 100;
        }
        else if (pool.token.rewards && pool.token.rewards.length > 0) {
            const reward = pool.token.rewards[0]; // Take first reward
            rewardApr = reward.rate ? parseFloat(reward.rate) / 100 : 0;
        }
        // Calculate total APY
        const totalApy = lendingApr + rewardApr;
        // Create and save APY record
        const apy = new apy_1.Apy("Fluid", tokenAddress, totalApy.toFixed(2), "0", // No borrow APY data available
        rewardApr.toFixed(2));
        await orm.em.persistAndFlush(apy);
        console.log(`Fluid APY saved for ${pool.token.symbol} on chain ${marketInfo.chainId}: ${totalApy.toFixed(2)}% (${lendingApr.toFixed(2)}% lending + ${rewardApr.toFixed(2)}% rewards)`);
        return {
            apy: totalApy,
            lendingApr,
            rewardApr,
            tokenSymbol: pool.token.symbol,
            chainId: marketInfo.chainId
        };
    }
    catch (err) {
        console.error(`Fluid Error fetching APY for chain ${marketInfo.chainId}:`, err.message);
        return err.message || 'Internal error';
    }
};
exports.default = getFluidApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9mbHVpZC9hcHlJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLDBDQUF1QztBQUV2QywrQ0FBOEU7QUFFOUUsTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLFlBQW9CLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFDbEUsTUFBTSxVQUFVLEdBQUcsdUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2QsT0FBTywyQkFBMkIsQ0FBQztJQUN2QyxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLElBQUksVUFBVSxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLE9BQU8sS0FBSyxLQUFLLEVBQUUsQ0FBQztRQUMzRCxPQUFPLG1DQUFtQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDRCxtREFBbUQ7UUFDbkQsTUFBTSxNQUFNLEdBQUcsNkNBQTZDLFVBQVUsQ0FBQyxPQUFPLFVBQVUsMEJBQWMsWUFBWSxDQUFDO1FBQ25ILE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7UUFFeEMsK0JBQStCO1FBQy9CLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtZQUMvQixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsQ0FBQztZQUMxRCxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakQsT0FBTyxZQUFZLEtBQUssYUFBYSxDQUFDO1FBQzFDLENB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