"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const apy_1 = require("../../models/apy");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
const getAveApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_2.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }
    const rpcUrl = constants_2.RPC_URLS[marketInfo.chainId];
    if (!rpcUrl) {
        return 'Unsupported chain RPC';
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const marketAddress = constants_1.AVEE_MARKETS[marketInfo.chainId]?.[marketInfo.market];
    if (!marketAddress) {
        return 'Aave market not found for this token';
    }
    const dataProvider = new ethers_1.ethers.Contract(marketAddress, constants_1.aaveABI, provider);
    try {
        const reserveData = await dataProvider.getReserveData(ethers_1.ethers.isAddress(tokenAddress) ? tokenAddress : constants_2.SIMILAR_TOKENS_AND_CURRENY[tokenAddress]);
        const currentLiquidityRate = reserveData[3];
        const currentVariableBorrowRate = reserveData[4];
        const supplyApr = parseFloat(ethers_1.ethers.formatUnits(currentLiquidityRate, 27));
        const borrowApr = parseFloat(ethers_1.ethers.formatUnits(currentVariableBorrowRate, 27));
        await orm.em.persistAndFlush(new apy_1.Apy("Ave", tokenAddress, ((0, utils_1.aprToApy)(supplyApr) / 100).toFixed(2), (0, utils_1.aprToApy)(borrowApr).toFixed(2), "0"));
    }
    catch (err) {
        console.error('Avee Error fetching Aave APY:', err);
        return err.message || 'Internal error';
    }
};
exports.default = getAveApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9hdmVlL2FweUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBZ0M7QUFDaEMsMkNBQW9EO0FBQ3BELDBDQUF1QztBQUN2QywrQ0FBb0c7QUFFcEcsdUNBQXVDO0FBRXZDLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxZQUFvQixFQUFFLEdBQWEsRUFBRSxFQUFFO0lBRWhFLE1BQU0sVUFBVSxHQUFHLHVDQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNkLE9BQU8sMkJBQTJCLENBQUM7SUFDdkMsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLG9CQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNWLE9BQU8sdUJBQXVCLENBQUM7SUFDbkMsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksZUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVwRCxNQUFNLGFBQWEsR0FBRyx3QkFBWSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU1RSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDakIsT0FBTyxzQ0FBc0MsQ0FBQztJQUNsRCxDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFNLENBQUMsUUFBUSxDQUNwQyxhQUFhLEVBQ2IsbUJBQU8sRUFDUCxRQUFRLENBQ1gsQ0FBQztJQUVGLElBQUksQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLGNBQWMsQ0FBQyxlQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLHNDQUEwQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFaEosTUFBTSxvQkFBb0IsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUMsTUFBTSx5QkFBeUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRSxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBTSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBR2hGLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxTQUFHLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBQSxnQkFBUSxFQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTVJLENBQUM7SUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDcEQsT0FBTyxHQUFHLENBQUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDO0lBQzNDLENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRCxrQkFBZSxhQUFhLENBQUEifQ==