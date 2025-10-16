import axios from "axios";
import { Apy } from "../../models/apy";
import { MikroORM } from "@mikro-orm/mongodb";
import { SUPPORTED_TOKENS_TO_MARKETS } from "../../constants";

const LIDO_API_URL = "https://eth-api.lido.fi/v1/protocol/steth/apr/sma";

const getLidoApyInfo = async (tokenAddress: string, orm: MikroORM) => {
    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }

    // Only support Ethereum ETH/WETH tokens
    if (marketInfo.chainId !== 1) {
        return 'Lido only supported on Ethereum';
    }

    // Only support ETH-related tokens
    if (marketInfo.market !== "ETH" && marketInfo.market !== "WETH") {
        return 'Lido only supports ETH/WETH tokens';
    }

    try {
        // Fetch data from Lido API
        const response = await axios.get(LIDO_API_URL);
        const data = response.data;

        if (!data || !data.data || typeof data.data.smaApr !== 'number') {
            console.log('Lido API response missing smaApr data');
            return 'No stETH APR data available';
        }

        // Extract stETH Simple Moving Average APR (already in percentage format)
        const stethApr = data.data.smaApr;
        
        // Get latest APR point for comparison
        const latestApr = data.data.aprs && data.data.aprs.length > 0 
            ? data.data.aprs[data.data.aprs.length - 1].apr 
            : stethApr;

        // stETH APR is the total liquid staking yield
        const totalApy = stethApr;

        // Create and save APY record
        const apy = new Apy(
            "Lido", 
            tokenAddress, 
            totalApy.toFixed(2), 
            "0", // No borrow APY for staking
            "0"  // No separate reward APY (included in total)
        );

        await orm.em.persistAndFlush(apy);

        console.log(`Lido APY saved for ${marketInfo.market}: ${totalApy.toFixed(2)}% (stETH SMA APR)`);

        return {
            apy: totalApy,
            stethApr: stethApr,
            latestApr: latestApr,
            tokenSymbol: marketInfo.market
        };

    } catch (err: any) {
        console.error('Lido Error fetching APY:', err.message);
        return err.message || 'Internal error';
    }
};

export default getLidoApyInfo; 