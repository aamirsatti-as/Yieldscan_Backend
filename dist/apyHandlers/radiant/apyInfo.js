"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const apy_1 = require("../../models/apy");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
const getRadiantApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_2.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }
    const rpcUrl = constants_2.RPC_URLS[marketInfo.chainId];
    if (!rpcUrl) {
        return 'Unsupported chain RPC';
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const marketAddress = constants_1.RADIANT_MARKETS[marketInfo.chainId]?.[marketInfo.market];
    if (!marketAddress) {
        return 'Radiant market not found for this token';
    }
    const dataProvider = new ethers_1.ethers.Contract(marketAddress, constants_1.radiantABI, provider);
    try {
        const reserveData = await dataProvider.getReserveData(ethers_1.ethers.isAddress(tokenAddress) ? tokenAddress : constants_2.SIMILAR_TOKENS_AND_CURRENY[tokenAddress]);
        const currentLiquidityRate = reserveData[3];
        const currentVariableBorrowRate = reserveData[4];
        const supplyApr = parseFloat(ethers_1.ethers.formatUnits(currentLiquidityRate, 27));
        const borrowApr = parseFloat(ethers_1.ethers.formatUnits(currentVariableBorrowRate, 27));
        await orm.em.persistAndFlush(new apy_1.Apy("Radiant", tokenAddress, (0, utils_1.aprToApy)(supplyApr).toFixed(2), (0, utils_1.aprToApy)(borrowApr).toFixed(2), "0"));
    }
    catch (err) {
        console.error('Radiant Error fetching Radiant APY:', err);
        return err.message || 'Internal error';
    }
};
exports.default = getRadiantApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9yYWRpYW50L2FweUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBZ0M7QUFDaEMsMkNBQTBEO0FBQzFELDBDQUF1QztBQUN2QywrQ0FBb0c7QUFFcEcsdUNBQXVDO0FBRXZDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLFlBQW9CLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFFcEUsTUFBTSxVQUFVLEdBQUcsdUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2QsT0FBTywyQkFBMkIsQ0FBQztJQUN2QyxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsb0JBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1YsT0FBTyx1QkFBdUIsQ0FBQztJQUNuQyxDQUFDO0lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBELE1BQU0sYUFBYSxHQUFHLDJCQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRS9FLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqQixPQUFPLHlDQUF5QyxDQUFDO0lBQ3JELENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU0sQ0FBQyxRQUFRLENBQ3BDLGFBQWEsRUFDYixzQkFBVSxFQUNWLFFBQVEsQ0FDWCxDQUFDO0lBRUYsSUFBSSxDQUFDO1FBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxZQUFZLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsc0NBQTBCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUVoSixNQUFNLG9CQUFvQixHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxNQUFNLHlCQUF5QixHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFNLENBQUMsV0FBVyxDQUFDLHlCQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFaEYsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLFNBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUEsZ0JBQVEsRUFBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBQSxnQkFBUSxFQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXhJLENBQUM7SUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUQsT0FBTyxHQUFHLENBQUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDO0lBQzNDLENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRCxrQkFBZSxpQkFBaUIsQ0FBQSJ9