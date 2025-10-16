import axios from "axios";
import { Apy } from "../../models/apy";
import { MikroORM } from "@mikro-orm/mongodb";
import { SIMILAR_TOKENS_AND_CURRENY, SUPPORTED_TOKENS_TO_MARKETS } from "../../constants";
import { ethers } from "ethers";

const MORPHO_GRAPHQL_URL = "https://api.morpho.org/graphql"; // Need to confirm this URL

const getMorphoApyInfo = async (tokenAddress: string, orm: MikroORM) => {
    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[tokenAddress];
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

        const response = await axios.post(MORPHO_GRAPHQL_URL, graphqlQuery, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const vaults = response.data?.data?.vaults?.items || [];
        const tokenAddressFinal = ethers.isAddress(tokenAddress) ? tokenAddress : SIMILAR_TOKENS_AND_CURRENY[tokenAddress]
        // Find vault(s) for this token
        const matchingVaults = vaults.filter((vault: any) => {
            const assetAddress = vault.asset?.address?.toLowerCase();
            const targetAddress = tokenAddressFinal.toLowerCase();
            return assetAddress === targetAddress;
        });

        if (matchingVaults.length === 0) {
            console.log(`Morpho vault not found for token: ${tokenAddress}`);
            return 'Morpho vault not found for this token';
        }

        // Use the highest APY vault if multiple exist
        const bestVault = matchingVaults.reduce((best: any, current: any) => {
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
        const apy = new Apy(
            "Morpho",
            tokenAddress,
            netApy.toFixed(2),
            "0", // No borrow APY data available
            rewardApy.toFixed(2)
        );

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

    } catch (err: any) {
        console.error('Morpho Error fetching APY:', err.message);
        return err.message || 'Internal error';
    }
};

export default getMorphoApyInfo; 