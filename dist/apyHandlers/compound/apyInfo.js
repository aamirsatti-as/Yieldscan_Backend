"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const constants_1 = require("../../constants");
const axios_1 = __importDefault(require("axios"));
const apy_1 = require("../../models/apy");
const constants_2 = require("./constants");
const getCompundApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_1.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }
    const rpcUrl = constants_1.RPC_URLS[marketInfo.chainId];
    if (!rpcUrl) {
        return 'Unsupported chain RPC';
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const marketAddress = constants_2.COMPOUND_V3_MARKETS[marketInfo.chainId]?.[marketInfo.market];
    if (!marketAddress) {
        return 'Compound market not found for this token';
    }
    const contract = new ethers_1.ethers.Contract(marketAddress, constants_2.compoundV3ABI, provider);
    try {
        const utilization = await contract.getUtilization();
        const supplyRate = await contract.getSupplyRate(utilization);
        const borrowRate = await contract.getBorrowRate(utilization);
        const rateDecimal = Number(ethers_1.ethers.formatUnits(supplyRate, 18));
        const borrowRateDecimal = Number(ethers_1.ethers.formatUnits(borrowRate, 18));
        const rewardsUrl = `https://v3-api.compound.finance/account/${constants_1.WALLET_ADDRESS}/rewards`;
        const rewardsResponse = await axios_1.default.get(rewardsUrl);
        const rewards = rewardsResponse.data;
        const reward = rewards.find((r) => r.comet.address.toLowerCase() === marketAddress.toLowerCase() &&
            r.chain_id === marketInfo.chainId);
        const rewardApy = reward ? parseFloat(reward.earn_rewards_apr) * 100 : 0;
        const toApy = (rate) => {
            if (rate < 0.000001)
                return rate * constants_1.SECONDS_PER_YEAR * 100;
            try {
                const apy = (Math.pow(1 + rate, constants_1.SECONDS_PER_YEAR) - 1) * 100;
                return !isFinite(apy) || apy > 1000 ? rate * constants_1.SECONDS_PER_YEAR * 100 : apy;
            }
            catch {
                return rate * constants_1.SECONDS_PER_YEAR * 100;
            }
        };
        const supplyApy = toApy(rateDecimal);
        const borrowApy = toApy(borrowRateDecimal);
        const totalApy = supplyApy + rewardApy;
        const apy = new apy_1.Apy("Compound", tokenAddress, totalApy.toString(), borrowApy.toString(), rewardApy.toString());
        await orm.em.persistAndFlush(apy);
        return {
            apy: totalApy,
            borrowApy,
            rewardApy
        };
    }
    catch (err) {
        console.error('Compound Error fetching Compound APY:', err);
        return err.message || 'Internal error';
    }
};
exports.default = getCompundApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9jb21wb3VuZC9hcHlJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLCtDQUEwRztBQUMxRyxrREFBMEI7QUFDMUIsMENBQXVDO0FBQ3ZDLDJDQUFpRTtBQUtqRSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxZQUFvQixFQUFFLEdBQWEsRUFBRSxFQUFFO0lBQ3BFLE1BQU0sVUFBVSxHQUFHLHVDQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNkLE9BQU8sMkJBQTJCLENBQUM7SUFDdkMsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLG9CQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNWLE9BQU8sdUJBQXVCLENBQUM7SUFDbkMsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksZUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVwRCxNQUFNLGFBQWEsR0FBRywrQkFBbUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkYsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sMENBQTBDLENBQUM7SUFDdEQsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksZUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUseUJBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUU3RSxJQUFJLENBQUM7UUFDRCxNQUFNLFdBQVcsR0FBaUIsTUFBTSxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbEUsTUFBTSxVQUFVLEdBQWlCLE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxX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