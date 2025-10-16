import axios from "axios";
import { Apy } from "../../models/apy";
import { MikroORM } from "@mikro-orm/mongodb";
import { SUPPORTED_TOKENS_TO_MARKETS } from "../../constants";

const ROCKETPOOL_API_URL = "https://stake.rocketpool.net/api/mainnet/payload";

const getRocketPoolApyInfo = async (tokenAddress: string, orm: MikroORM) => {
    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
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
        const response = await axios.get(ROCKETPOOL_API_URL);
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
        const apy = new Apy(
            "RocketPool", 
            tokenAddress, 
            totalApy.toFixed(2), 
            "0", // No borrow APY for staking
            "0"  // No separate reward APY (included in total)
        );

        await orm.em.persistAndFlush(apy);

        console.log(`Rocket Pool APY saved for ${marketInfo.market}: ${totalApy.toFixed(2)}% (rETH staking APR)`);

        return {
            apy: totalApy,
            rethApr: rethApr,
            beaconChainApr: beaconChainApr,
            tokenSymbol: marketInfo.market
        };

    } catch (err: any) {
        console.error('Rocket Pool Error fetching APY:', err.message);
        return err.message || 'Internal error';
    }
};

export default getRocketPoolApyInfo; 