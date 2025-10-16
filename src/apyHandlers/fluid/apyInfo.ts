import axios from "axios";
import { Apy } from "../../models/apy";
import { MikroORM } from "@mikro-orm/mongodb";
import { SUPPORTED_TOKENS_TO_MARKETS, WALLET_ADDRESS } from "../../constants";

const getFluidApyInfo = async (tokenAddress: string, orm: MikroORM) => {
    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }

    // Only support Ethereum and Arbitrum for now
    if (marketInfo.chainId !== 1 && marketInfo.chainId !== 42161) {
        return 'Fluid not supported on this chain';
    }

    try {
        // Fetch data from Fluid API for the specific chain
        const apiUrl = `https://api.fluid.instadapp.io/v2/lending/${marketInfo.chainId}/users/${WALLET_ADDRESS}/positions`;
        const response = await axios.get(apiUrl);
        const pools = response.data?.data || [];

        // Find the pool for this token
        const pool = pools.find((p: any) => {
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
        } else if (pool.token.rewards && pool.token.rewards.length > 0) {
            const reward = pool.token.rewards[0]; // Take first reward
            rewardApr = reward.rate ? parseFloat(reward.rate) / 100 : 0;
        }

        // Calculate total APY
        const totalApy = lendingApr + rewardApr;

        // Create and save APY record
        const apy = new Apy(
            "Fluid",
            tokenAddress,
            totalApy.toFixed(2),
            "0", // No borrow APY data available
            rewardApr.toFixed(2)
        );

        await orm.em.persistAndFlush(apy);

        console.log(`Fluid APY saved for ${pool.token.symbol} on chain ${marketInfo.chainId}: ${totalApy.toFixed(2)}% (${lendingApr.toFixed(2)}% lending + ${rewardApr.toFixed(2)}% rewards)`);

        return {
            apy: totalApy,
            lendingApr,
            rewardApr,
            tokenSymbol: pool.token.symbol,
            chainId: marketInfo.chainId
        };

    } catch (err: any) {
        console.error(`Fluid Error fetching APY for chain ${marketInfo.chainId}:`, err.message);
        return err.message || 'Internal error';
    }
};

export default getFluidApyInfo; 