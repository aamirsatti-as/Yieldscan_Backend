import { ethers } from "ethers";
import { aaveABI, AVEE_MARKETS } from "./constants";
import { Apy } from "../../models/apy";
import { RPC_URLS, SIMILAR_TOKENS_AND_CURRENY, SUPPORTED_TOKENS_TO_MARKETS } from "../../constants";
import { MikroORM } from "@mikro-orm/mongodb";
import { aprToApy } from "../../utils";

const getAveApyInfo = async (tokenAddress: string, orm: MikroORM) => {

    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }

    const rpcUrl = RPC_URLS[marketInfo.chainId];
    if (!rpcUrl) {
        return 'Unsupported chain RPC';
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const marketAddress = AVEE_MARKETS[marketInfo.chainId]?.[marketInfo.market];

    if (!marketAddress) {
        return 'Aave market not found for this token';
    }

    const dataProvider = new ethers.Contract(
        marketAddress,
        aaveABI,
        provider
    );

    try {
        const reserveData = await dataProvider.getReserveData(ethers.isAddress(tokenAddress) ? tokenAddress : SIMILAR_TOKENS_AND_CURRENY[tokenAddress]);

        const currentLiquidityRate = reserveData[3];
        const currentVariableBorrowRate = reserveData[4];
        const supplyApr = parseFloat(ethers.formatUnits(currentLiquidityRate, 27));
        const borrowApr = parseFloat(ethers.formatUnits(currentVariableBorrowRate, 27));


        await orm.em.persistAndFlush(new Apy("Ave", tokenAddress, (aprToApy(supplyApr) / 100).toFixed(2), aprToApy(borrowApr).toFixed(2), "0"));

    } catch (err: any) {
        console.error('Avee Error fetching Aave APY:', err);
        return err.message || 'Internal error';
    }
}

export default getAveApyInfo