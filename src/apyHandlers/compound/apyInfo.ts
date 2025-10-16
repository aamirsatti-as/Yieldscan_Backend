import { BigNumberish, ethers } from "ethers";
import { RPC_URLS, SECONDS_PER_YEAR, SUPPORTED_TOKENS_TO_MARKETS, WALLET_ADDRESS } from "../../constants";
import axios from "axios";
import { Apy } from "../../models/apy";
import { COMPOUND_V3_MARKETS, compoundV3ABI } from "./constants";
import { MikroORM } from "@mikro-orm/mongodb";



const getCompundApyInfo = async (tokenAddress: string, orm: MikroORM) => {
    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }

    const rpcUrl = RPC_URLS[marketInfo.chainId];
    if (!rpcUrl) {
        return 'Unsupported chain RPC';
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const marketAddress = COMPOUND_V3_MARKETS[marketInfo.chainId]?.[marketInfo.market];
    if (!marketAddress) {
        return 'Compound market not found for this token';
    }

    const contract = new ethers.Contract(marketAddress, compoundV3ABI, provider);

    try {
        const utilization: BigNumberish = await contract.getUtilization();
        const supplyRate: BigNumberish = await contract.getSupplyRate(utilization);
        const borrowRate: BigNumberish = await contract.getBorrowRate(utilization);

        const rateDecimal = Number(ethers.formatUnits(supplyRate, 18));
        const borrowRateDecimal = Number(ethers.formatUnits(borrowRate, 18));

        const rewardsUrl = `https://v3-api.compound.finance/account/${WALLET_ADDRESS}/rewards`;
        const rewardsResponse = await axios.get(rewardsUrl);
        const rewards = rewardsResponse.data;

        const reward = rewards.find(
            (r: any) =>
                r.comet.address.toLowerCase() === marketAddress.toLowerCase() &&
                r.chain_id === marketInfo.chainId
        );

        const rewardApy = reward ? parseFloat(reward.earn_rewards_apr) * 100 : 0;

        const toApy = (rate: number) => {
            if (rate < 0.000001) return rate * SECONDS_PER_YEAR * 100;
            try {
                const apy = (Math.pow(1 + rate, SECONDS_PER_YEAR) - 1) * 100;
                return !isFinite(apy) || apy > 1000 ? rate * SECONDS_PER_YEAR * 100 : apy;
            } catch {
                return rate * SECONDS_PER_YEAR * 100;
            }
        };

        const supplyApy = toApy(rateDecimal);
        const borrowApy = toApy(borrowRateDecimal);
        const totalApy = supplyApy + rewardApy;

        const apy = new Apy("Compound", tokenAddress, totalApy.toString(), borrowApy.toString(), rewardApy.toString());

        await orm.em.persistAndFlush(apy);

        return {
            apy: totalApy,
            borrowApy,
            rewardApy
        };
    } catch (err: any) {
        console.error('Compound Error fetching Compound APY:', err);
        return err.message || 'Internal error';
    }
}


export default getCompundApyInfo