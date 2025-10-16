import axios from "axios";
import { Apy } from "../../models/apy";
import { MikroORM } from "@mikro-orm/mongodb";
import { SIMILAR_TOKENS_AND_CURRENY, SUPPORTED_TOKENS_TO_MARKETS } from "../../constants";
import { ethers } from "ethers";
export const fetchAndStoreVenusApy = async (tokenAddress: string, orm: MikroORM) => {
    try {
        const res = await axios.get('https://api.venus.io/pools');
        const ethereumRecord = res.data?.result || [];
        if (!tokenAddress) {
            return
        }

        const tokenAddresss = ethers.isAddress(tokenAddress) ? tokenAddress : SIMILAR_TOKENS_AND_CURRENY[tokenAddress];

        const currentChain = SUPPORTED_TOKENS_TO_MARKETS[tokenAddresss]
        // console.log('curre ',currentChain)
        const ethChain = ethereumRecord.find(
            (p: { chainId: string }) =>
                p.chainId === '1'
        );

        const arbitrumChain = ethereumRecord.find(
            (p: { chainId: string }) =>
                p.chainId === '42161'
        );
        const bscChain = ethereumRecord.find(
            (p: { chainId: string, name: string }) =>
                p.chainId === '56' &&
                p.name === "Core Pool",
        );

        const bscChainWBnb = ethereumRecord.find(
            (p: { chainId: string, name: string }) =>
                p.chainId === '56' &&
                p.name === "Liquid Staked BNB",
        );

        if (!ethChain) {
            console.log('ar ', arbitrumChain, bscChain, orm)
        }
        if (ethChain && currentChain.chainId == 1 && currentChain.market == 'USDT') {
            const usdtEthereum = ethChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, usdtEthereum.supplyApy, usdtEthereum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (ethChain && currentChain.chainId == 1 && currentChain.market == 'USDC') {
            const usdcEthereum = ethChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, usdcEthereum.supplyApy, usdcEthereum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (ethChain && currentChain.chainId == 1 && currentChain.market == 'WETH') {
            const wethEthereum = ethChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, wethEthereum.supplyApy, wethEthereum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (ethChain && currentChain.chainId == 1 && currentChain.market == 'DAI') {
            const daiEthereum = ethChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, daiEthereum.supplyApy, daiEthereum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);
        }
        if (arbitrumChain && currentChain.chainId == 42161 && currentChain.market == 'USDT') {
            const usdtArbitrum = arbitrumChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, usdtArbitrum.supplyApy, usdtArbitrum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (arbitrumChain && currentChain.chainId == 42161 && currentChain.market == 'USDC') {
            const usdcArbitrum = arbitrumChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, usdcArbitrum.supplyApy, usdcArbitrum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (arbitrumChain && currentChain.chainId == 42161 && currentChain.market == 'WETH') {
            const wethArbitrum = arbitrumChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, wethArbitrum.supplyApy, wethArbitrum.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (bscChain && currentChain.chainId == 56 && currentChain.market == 'USDT') {
            const usdtBSC = bscChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress?.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, usdtBSC.supplyApy, usdtBSC.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (bscChain && currentChain.chainId == 56 && currentChain.market == 'USDC') {
            const usdcBSC = bscChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress?.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, usdcBSC.supplyApy, usdcBSC.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }
        if (bscChain && currentChain.chainId == 56 && currentChain.market == 'DAI') {
            const daiBSC = bscChain.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress?.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, daiBSC.supplyApy, daiBSC.borrowApy, "0");
            await orm.em.persistAndFlush(apy);
        }
        if (bscChainWBnb && currentChain.chainId == 56 && currentChain.market == 'WBNB') {
            const wbnbBSC = bscChainWBnb.markets.find(
                (p: { underlyingAddress: string }) =>
                    p.underlyingAddress?.toLowerCase() === tokenAddresss.toLowerCase()
            );
            const apy = new Apy("Venus", tokenAddress, wbnbBSC.supplyApy, wbnbBSC.borrowApy, "0");
            await orm.em.persistAndFlush(apy);

        }

        console.log('APY data saved for vWETH_Core');
    } catch (err) {
        console.error('Failed to fetch and store Venus APY:', err instanceof Error ? err.message : 'Unknown error');
    }
};