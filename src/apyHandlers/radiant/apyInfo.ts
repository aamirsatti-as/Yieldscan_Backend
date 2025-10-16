import { ethers } from "ethers";
import { radiantABI, RADIANT_MARKETS } from "./constants";
import { Apy } from "../../models/apy";
import { RPC_URLS, SIMILAR_TOKENS_AND_CURRENY, SUPPORTED_TOKENS_TO_MARKETS } from "../../constants";
import { MikroORM } from "@mikro-orm/mongodb";
import { aprToApy } from "../../utils";

const getRadiantApyInfo = async (tokenAddress: string, orm: MikroORM) => {

    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }

    const rpcUrl = RPC_URLS[marketInfo.chainId];
    if (!rpcUrl) {
        return 'Unsupported chain RPC';
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const marketAddress = RADIANT_MARKETS[marketInfo.chainId]?.[marketInfo.market];

    if (!marketAddress) {
        return 'Radiant market not found for this token';
    }

    const dataProvider = new ethers.Contract(
        marketAddress,
        radiantABI,
        provider
    );

    try {
        const reserveData = await dataProvider.getReserveData(ethers.isAddress(tokenAddress) ? tokenAddress : SIMILAR_TOKENS_AND_CURRENY[tokenAddress]);

        const currentLiquidityRate = reserveData[3];
        const currentVariableBorrowRate = reserveData[4];
        const supplyApr = parseFloat(ethers.formatUnits(currentLiquidityRate, 27));
        const borrowApr = parseFloat(ethers.formatUnits(currentVariableBorrowRate, 27));

        await orm.em.persistAndFlush(new Apy("Radiant", tokenAddress, aprToApy(supplyApr).toFixed(2), aprToApy(borrowApr).toFixed(2), "0"));

    } catch (err: any) {
        console.error('Radiant Error fetching Radiant APY:', err);
        return err.message || 'Internal error';
    }
}

export default getRadiantApyInfo