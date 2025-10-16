"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const apy_1 = require("../../models/apy");
const constants_1 = require("../../constants");
const ethers_1 = require("ethers");
const MORPHO_GRAPHQL_URL = "https://api.morpho.org/graphql"; // Need to confirm this URL
const getMorphoApyInfo = async (tokenAddress, orm) => {
    const marketInfo = constants_1.SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
    if (!marketInfo) {
        return 'Unsupported token address';
    }
    // Only support Ethereum for now (chainId: 1)
    if (marketInfo.chainId !== 1) {
        return 'Morpho not supported on this chain';
    }
    try {
        // GraphQL query to get all vaults on Ethereum
        const graphqlQuery = {
            query: `
                query GetVaults($where: VaultFilters) {
                    vaults(where: $where) {
                        items {
                            id
                            name
                            address
                            symbol
                            asset {
                                address
                                symbol
                                name
                            }
                            state {
                                dailyApy
                                dailyNetApy
                                rewards {
                                    asset {
                                        symbol
                                    }
                                    supplyApr
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                where: {
                    chainId_in: [1]
                }
            }
        };
        const response = await axios_1.default.post(MORPHO_GRAPHQL_URL, graphqlQuery, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const vaults = response.data?.data?.vaults?.items || [];
        const tokenAddressFinal = ethers_1.ethers.isAddress(tokenAddress) ? tokenAddress : constants_1.SIMILAR_TOKENS_AND_CURRENY[tokenAddress];
        // Find vault(s) for this token
        const matchingVaults = vaults.filter((vault) => {
            const assetAddress = vault.asset?.address?.toLowerCase();
            const targetAddress = tokenAddressFinal.toLowerCase();
            return assetAddress === targetAddress;
        });
        if (matchingVaults.length === 0) {
            console.log(`Morpho vault not found for token: ${tokenAddress}`);
            return 'Morpho vault not found for this token';
        }
        // Use the highest APY vault if multiple exist
        const bestVault = matchingVaults.reduce((best, current) => {
            const currentApy = current.state?.dailyNetApy || 0;
            const bestApy = best.state?.dailyNetApy || 0;
            return currentApy > bestApy ? current : best;
        });
        // Extract APY data
        const netApy = bestVault.state?.dailyNetApy || 0; // Already in percentage format
        const baseApy = bestVault.state?.dailyApy || 0; // Already in percentage format
        // Calculate reward APY (difference between net and base)
        const rewardApy = netApy - baseApy;
        // Create and save APY record
        const apy = new apy_1.Apy("Morpho", tokenAddress, netApy.toFixed(2), "0", // No borrow APY data available
        rewardApy.toFixed(2));
        await orm.em.persistAndFlush(apy);
        console.log(`Morpho APY saved for ${bestVault.asset.symbol} (${bestVault.name}): ${netApy.toFixed(2)}% (${baseApy.toFixed(2)}% base + ${rewardApy.toFixed(2)}% rewards)`);
        return {
            apy: netApy,
            baseApy,
            rewardApy,
            vaultName: bestVault.name,
            vaultSymbol: bestVault.symbol,
            tokenSymbol: bestVault.asset.symbol
        };
    }
    catch (err) {
        console.error('Morpho Error fetching APY:', err.message);
        return err.message || 'Internal error';
    }
};
exports.default = getMorphoApyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHlIYW5kbGVycy9tb3JwaG8vYXB5SW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUEwQjtBQUMxQiwwQ0FBdUM7QUFFdkMsK0NBQTBGO0FBQzFGLG1DQUFnQztBQUVoQyxNQUFNLGtCQUFrQixHQUFHLGdDQUFnQyxDQUFDLENBQUMsMkJBQTJCO0FBRXhGLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLFlBQW9CLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFDbkUsTUFBTSxVQUFVLEdBQUcsdUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2QsT0FBTywyQkFBMkIsQ0FBQztJQUN2QyxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLElBQUksVUFBVSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMzQixPQUFPLG9DQUFvQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxJQUFJLENBQUM7UUFDRCw4Q0FBOEM7UUFDOUMsTUFBTSxZQUFZLEdBQUc7WUFDakIsS0FBSyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzthQTBCTjtZQUNELFNBQVMsRUFBRTtnQkFDUCxLQUFLLEVBQUU7b0JBQ0gsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNsQjthQUNKO1NBQ0osQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUU7WUFDaEUsT0FBTyxFQUFFO2dCQUNMLGNBQWMsRUFBRSxrQkFBa0I7YUFDckM7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN4RCxNQUFNLGlCQUFpQixH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