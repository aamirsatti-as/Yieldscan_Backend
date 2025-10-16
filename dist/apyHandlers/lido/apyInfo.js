"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const apy_1 = require("../../models/apy");
const constants_1 = require("../../constants");
const LIDO_API_URL = "https://eth-api.lido.fi/v1/protocol/steth/apr/sma";
const getLidoApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_1.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
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
        const response = await axios_1.default.get(LIDO_API_URL);
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
        const apy = new apy_1.Apy("Lido", tokenAddress, totalApy.toFixed(2), "0", // No borrow APY for staking
        "0" // No separate reward APY (included in total)
        );
        await orm.em.persistAndFlush(apy);
        console.log(`Lido APY saved for ${marketInfo.market}: ${totalApy.toFixed(2)}% (stETH SMA APR)`);
        return {
            apy: totalApy,
            stethApr: stethApr,
            latestApr: latestApr,
            tokenSymbol: marketInfo.market
        };
    }
    catch (err) {
        console.error('Lido Error fetching APY:', err.message);
        return err.message || 'Internal error';
    }
};
exports.default = getLidoApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9saWRvL2FweUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsMENBQXVDO0FBRXZDLCtDQUE4RDtBQUU5RCxNQUFNLFlBQVksR0FBRyxtREFBbUQsQ0FBQztBQUV6RSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsWUFBb0IsRUFBRSxHQUFhLEVBQUUsRUFBRTtJQUNqRSxNQUFNLFVBQVUsR0FBRyx1Q0FBMkIsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM3RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDZCxPQUFPLDJCQUEyQixDQUFDO0lBQ3ZDLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsSUFBSSxVQUFVLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzNCLE9BQU8saUNBQWlDLENBQUM7SUFDN0MsQ0FBQztJQUVELGtDQUFrQztJQUNsQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssS0FBSyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDOUQsT0FBTyxvQ0FBb0MsQ0FBQztJQUNoRCxDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0QsMkJBQTJCO1FBQzNCLE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBRTNCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sNkJBQTZCLENBQUM7UUFDekMsQ0FBQztRQUVELHlFQUF5RTtRQUN6RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUVsQyxzQ0FBc0M7UUFDdEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDekQsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO1lBQy9DLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFFZiw4Q0FBOEM7UUFDOUMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRTFCLDZCQUE2QjtRQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLFNBQUcsQ0FDZixNQUFNLEVBQ04sWUFBWSxFQUNaLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQ25CLEdBQUcsRUFBRSw0QkFBNEI7UUFDakMsR0FBRyxDQUFFLDZDQUE2QztTQUNyRCxDQUFDO1FBRUYsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixVQUFVLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFaEcsT0FBTztZQUNILEdBQUcsRUFBRSxRQUFRO1lBQ2IsUUFBUSxFQUFFLFFBQVE7WUFDbEIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNO1NBQ2pDLENBQUM7SUFFTixDQUFDO0lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2RCxPQUFPLEdBQUcsQ0FBQyxPQUFPLElBQUksZ0JBQWdCLENBQUM7SUFDM0MsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLGtCQUFlLGNBQWMsQ0FBQyJ9