"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTransactions = getUserTransactions;
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const userDetails_1 = require("./models/userDetails");
const async_mutex_1 = require("async-mutex");
async function withRetry(fn, delayMs = 2000, type = "api") {
    while (true) {
        try {
            let data = await fn();
            //@ts-ignore
            if (type == "api" && data.data?.message !== "OK" && data.data?.message !== "No transactions found") {
                //@ts-ignore
                throw new Error(data.data);
            }
            return data;
        }
        catch (err) {
            if (type === "receipt") {
                console.log("receipt", err);
            }
            // if (i === retries - 1) throw err;
            // console.log(`Retrying after error: ${err.message}`);
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
    // throw new Error("Max retries reached");
}
const CONTRACTS_ABIS = {
    Aave: [
        "event Supply (address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)",
        "event Withdraw (address indexed reserve, address indexed user, address indexed to, uint256 amount)"
    ],
    Radiant: [
        "event Deposit (address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referral)",
        "event Withdraw (address indexed reserve, address indexed user, address indexed to, uint256 amount)"
    ],
    Compound: [
        "event Supply (address indexed from, address indexed dst, uint256 amount)",
        "event Withdraw (address indexed src, address indexed to, uint256 amount)"
    ],
    Venus: [
        "event Mint (address minter, uint256 mintAmount, uint256 mintTokens)",
        "event Mint (address minter, uint256 mintAmount, uint256 mintTokens, uint256 totalSupply)",
        "event Mint (address indexed minter, uint256 mintAmount, uint256 mintTokens, uint256 accountBalance)",
        "event Redeem (address redeemer, uint256 redeemAmount, uint256 redeemTokens)",
        "event Redeem (address redeemer, uint256 redeemAmount, uint256 redeemTokens, uint256 totalSupply)",
        "event Redeem (address indexed redeemer, uint256 redeemAmount, uint256 redeemTokens, uint256 accountBalance)"
    ],
    Morpho: [
        "event Deposit (address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
        "event Withdraw (address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
    ],
    Fluid: [
        "event LogOperate (address indexed user, address indexed token, int256 supplyAmount, int256 borrowAmount, address withdrawTo, address borrowTo, uint256 totalAmounts, uint256 exchangePricesAndConfig)"
    ]
};
// addresses should be lower case
const CONTRACTS = {
    1: {
        "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {
            native: "0xd01607c3c5ecaba394d8be377a08590149325722",
            nativeSymbol: "ETH",
            protocol: "Aave"
        },
        "0xa950974f64aa33f27f6c5e017eee93bf7588ed07": {
            native: "0xf251030daea3f09ed7d118f57f4b91f281250527",
            nativeSymbol: "ETH",
            protocol: "Radiant"
        },
        "0xa17581a9e3356d9a858b789d68b4d866e593ae94": {
            native: "0xa397a8c2086c554b531c02e29f3291c9704b00c7",
            nativeSymbol: "ETH",
            protocol: "Compound"
        },
        "0xc3d688b66703497daa19211eedff47f25384cdc3": {
            native: "",
            nativeSymbol: "USDC",
            protocol: "Compound"
        },
        "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840": {
            native: "",
            nativeSymbol: "USDT",
            protocol: "Compound"
        },
        "0x7c8ff7d2a1372433726f879bd945ffb250b94c65": {
            native: "",
            nativeSymbol: "ETH",
            protocol: "Venus"
        },
        "0x17c07e0c232f2f80dfdbd7a95b942d893a4c5acb": {
            native: "",
            nativeSymbol: "USDC",
            protocol: "Venus"
        },
        "0x8c3e3821259b82ffb32b2450a95d2dcbf161c24e": {
            native: "",
            nativeSymbol: "USDT",
            protocol: "Venus"
        },
        "0xd8add9b41d4e1cd64edad8722ab0ba8d35536657": {
            native: "",
            nativeSymbol: "DAI",
            protocol: "Venus"
        },
        "0x9a8bc3b04b7f3d87cfc09ba407dced575f2d61d8": {
            native: "0x6566194141eefa99af43bb5aa71460ca2dc90245",
            nativeSymbol: "ETH", //MEV Capital wETH
            protocol: "Morpho",
        },
        "0xd63070114470f685b75b74d60eec7c1113d33a3d": {
            native: "0x6566194141eefa99af43bb5aa71460ca2dc90245",
            nativeSymbol: "USDC", //MEV Capital USDC
            protocol: "Morpho"
        },
        "0xbeef047a543e45807105e51a8bbefcc5950fcfba": {
            native: "0x6566194141eefa99af43bb5aa71460ca2dc90245",
            nativeSymbol: "USDT", //Steakhouse USDT
            protocol: "Morpho"
        },
        "0x73e65dbd630f90604062f6e02fab9138e713edd9": {
            native: "0x6566194141eefa99af43bb5aa71460ca2dc90245",
            nativeSymbol: "DAI", //Spark DAI Vault
            protocol: "Morpho"
        },
        "0x52aa899454998be5b000ad077a46bbe360f4e497": {
            native: "",
            nativeSymbol: "USDC", //Fluid USDC
            protocol: "Fluid",
            yieldbearingToken: "0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33"
        },
    },
    42161: {
        "0x794a61358d6845594f94dc1db02a252b5b4814ad": {
            native: "0x5283beced7adf6d003225c13896e536f2d4264ff",
            nativeSymbol: "ETH",
            protocol: "Aave"
        },
        "0xe23b4ae3624fb6f7cdef29bc8ead912f1ede6886": {
            native: "0x8a8f65cabb82a857fa22289ad0a5785a5e7dbd22",
            nativeSymbol: "ETH",
            protocol: "Radiant"
        },
        "0x6f7d514bbd4aff3bcd1140b7344b32f063dee486": {
            native: "0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d",
            nativeSymbol: "ETH",
            protocol: "Compound"
        },
        "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf": {
            native: "",
            nativeSymbol: "USDC",
            protocol: "Compound"
        },
        "0xd98be00b5d27fc98112bde293e487f8d4ca57d07": {
            native: "",
            nativeSymbol: "USDT",
            protocol: "Compound"
        },
        "0x68a34332983f4bf866768dd6d6e638b02ef5e1f0": {
            native: "",
            nativeSymbol: "ETH",
            protocol: "Venus"
        },
        "0x7d8609f8da70ff9027e9bc5229af4f6727662707": {
            native: "",
            nativeSymbol: "USDC",
            protocol: "Venus"
        },
        "0xb9f9117d4200dc296f9acd1e8be1937df834a2fd": {
            native: "",
            nativeSymbol: "USDT",
            protocol: "Venus"
        },
        "0x9b33073eb98a9a1eb408dedcd08616fe850b3f09": {
            native: "0x1fa4431bc113d308bee1d46b0e98cb805fb48c13",
            nativeSymbol: "ETH", //MEV Capital wETH
            protocol: "Morpho",
        },
        "0xa60643c90a542a95026c0f1dbdb0615ff42019cf": {
            native: "0x1fa4431bc113d308bee1d46b0e98cb805fb48c13",
            nativeSymbol: "USDC", //MEV Capital USDC
            protocol: "Morpho"
        },
        "0x139250cdb310d657eac506c7c7fc6acde34af1ec": {
            native: "0x1fa4431bc113d308bee1d46b0e98cb805fb48c13",
            nativeSymbol: "USDT", //Gauntlet USDT0 Core
            protocol: "Morpho"
        }
    },
    56: {
        "0x6807dc923806fe8fd134338eabca509979a7e0cb": {
            native: "0x0c2c95b24529664fe55d4437d7a31175cfe6c4f7",
            nativeSymbol: "BNB",
            protocol: "Aave"
        },
        "0xccf31d54c3a94f67b8ceff8dd771de5846da032c": {
            native: "0xd0fc69dc0e720d5be669e53b7b5015f6fc258ac9",
            nativeSymbol: "BNB",
            protocol: "Radiant"
        },
        "0xa07c5b74c9b40447a954e1466938b865b6bbea36": {
            native: "",
            nativeSymbol: "BNB",
            protocol: "Venus"
        },
        "0xe10e80b7fd3a29fe46e16c30cc8f4dd938b742e2": {
            native: "",
            nativeSymbol: "WBNB",
            protocol: "Venus"
        },
        "0xeca88125a5adbe82614ffc12d0db554e2e2867c8": {
            native: "",
            nativeSymbol: "USDC",
            protocol: "Venus"
        },
        "0xfd5840cd36d94d7229439859c0112a4185bc0255": {
            native: "",
            nativeSymbol: "USDT",
            protocol: "Venus"
        },
        "0x334b3ecb4dca3593bccc3c7ebd1a1c1d1780fbf1": {
            native: "",
            nativeSymbol: "DAI",
            protocol: "Venus"
        }
    }
};
async function getUserTransactions(em, walletAddress, progressMap, requestId) {
    const output = { [walletAddress]: {} };
    const outputMutex = new async_mutex_1.Mutex();
    const progressMutex = new async_mutex_1.Mutex();
    const userDetails = await em.findOne(userDetails_1.UserDetails, { walletAddress });
    if (userDetails?.data?.[walletAddress]) {
        Object.assign(output[walletAddress], userDetails.data[walletAddress]);
    }
    let ethLastBlock = userDetails?.ethLastBlock ?? "0";
    let bscLastBlock = userDetails?.bscLastBlock ?? "0";
    let arbLastBlock = userDetails?.arbLastBlock ?? "0";
    await Promise.all(Object.keys(constants_1.RPC_URLS).map(async (id) => {
        let chainId = Number(id);
        if (!constants_1.RPC_URLS[chainId] || !constants_1.API_URLS[chainId])
            return;
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const blockUrl = `${constants_1.API_URLS[chainId].apiUrl}?chainid=${chainId}&module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${constants_1.API_URLS[chainId].apiKey}`;
            const blockApi = await withRetry(() => axios_1.default.get(blockUrl));
            const endblock = blockApi.data.result;
            const startBlock = chainId === 1
                ? ethLastBlock
                : chainId === 56
                    ? bscLastBlock
                    : chainId === 42161
                        ? arbLastBlock
                        : "0";
            const provider = new ethers_1.ethers.JsonRpcProvider(constants_1.RPC_URLS[chainId]);
            const url = `${constants_1.API_URLS[chainId].apiUrl}?chainid=${chainId}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endblock}&sort=desc&apikey=${constants_1.API_URLS[chainId].apiKey}`;
            const txs = await withRetry(() => axios_1.default.get(url));
            const txList = txs.data.result;
            let count = txList.length;
            if (count === 0) {
                if (chainId === 1)
                    ethLastBlock = endblock;
                if (chainId === 56)
                    bscLastBlock = endblock;
                if (chainId === 42161)
                    arbLastBlock = endblock;
            }
            for (const [index, tx] of txList.entries()) {
                if (index === 0 && tx?.blockNumber) {
                    const nextBlock = (Number(tx.blockNumber) + 1).toString();
                    if (chainId === 1)
                        ethLastBlock = nextBlock;
                    if (chainId === 56)
                        bscLastBlock = nextBlock;
                    if (chainId === 42161)
                        arbLastBlock = nextBlock;
                }
                await progressMutex.runExclusive(() => {
                    const current = progressMap.get(requestId) || {};
                    progressMap.set(requestId, {
                        ...current,
                        [constants_1.CHAIN_ID_TO_NAME[chainId]]: count,
                    });
                });
                const entry = Object.entries(CONTRACTS[chainId]).find(([key]) => key.toLowerCase() === tx.to?.toLowerCase() ||
                    CONTRACTS[chainId][key].native.toLowerCase() === tx.to?.toLowerCase() ||
                    walletAddress.toLowerCase() === tx.to?.toLowerCase() || // this is for fluid protocol
                    CONTRACTS[chainId][key].yieldbearingToken?.toLowerCase() === tx.to?.toLowerCase() // this is for fluid protocol
                );
                if (!entry) {
                    count--;
                    continue;
                }
                const txHash = tx.hash;
                try {
                    const receipt = await withRetry(() => provider.getTransactionReceipt(txHash), 2000, "receipt");
                    if (!receipt)
                        continue;
                    for (const log of receipt.logs) {
                        const contracts = CONTRACTS[chainId][log.address.toLowerCase()];
                        if (!contracts)
                            continue;
                        try {
                            const iface = new ethers_1.ethers.Interface(CONTRACTS_ABIS[contracts.protocol]);
                            const decoded = iface.parseLog(log);
                            console.log({ decoded, txHash });
                            if (!decoded)
                                continue;
                            const isDeposit = ["Supply", "Deposit", "Mint", "LogOperate"].includes(decoded.name);
                            const isWithdraw = ["Withdraw", "Redeem", "LogOperate"].includes(decoded.name);
                            if (!isDeposit && !isWithdraw)
                                continue;
                            const tokenEntry = Object.entries(constants_1.SUPPORTED_TOKENS_TO_MARKETS).find(([key]) => contracts.protocol === "Fluid" ? key.toLowerCase() === decoded.args[1]?.toLowerCase() : key.toLowerCase() === decoded.args[0]?.toLowerCase());
                            const token = tokenEntry?.[1] ??
                                ((contracts.protocol === "Compound" || contracts.protocol === "Venus" || contracts.protocol === "Morpho") && {
                                    chainId: Number(chainId),
                                    market: contracts.nativeSymbol,
                                });
                            const symbol = contracts.protocol !== "Venus"
                                ? decoded.args[1]?.toLowerCase() === contracts.native.toLowerCase()
                                    ? contracts.nativeSymbol
                                    : token && typeof token !== 'boolean' ? token.market : undefined
                                : token && typeof token !== 'boolean' ? token.market : undefined;
                            let valueIndex;
                            switch (contracts.protocol) {
                                case "Compound":
                                case "Fluid":
                                case "Morpho":
                                    if (contracts.protocol === "Morpho" && isWithdraw) {
                                        valueIndex = 3;
                                    }
                                    else {
                                        valueIndex = 2;
                                    }
                                    break;
                                case "Venus":
                                    valueIndex = 1;
                                    break;
                                default:
                                    valueIndex = 3;
                            }
                            const value = Number(decoded.args[valueIndex]);
                            if (!token || !symbol || isNaN(value))
                                continue;
                            await outputMutex.runExclusive(() => {
                                output[walletAddress][chainId] ??= {};
                                output[walletAddress][chainId][contracts.protocol] ??= {};
                                output[walletAddress][chainId][contracts.protocol][symbol] ??= {
                                    totalDeposit: 0,
                                    totalWithdraw: 0,
                                };
                                if (isDeposit && value > 0) {
                                    output[walletAddress][chainId][contracts.protocol][symbol].totalDeposit += value;
                                }
                                else if (isWithdraw) {
                                    output[walletAddress][chainId][contracts.protocol][symbol].totalWithdraw += Math.abs(value);
                                }
                            });
                        }
                        catch (err) {
                            console.log("Log parse error:", { chainId, txHash, walletAddress }, err);
                        }
                    }
                }
                catch (err) {
                    console.log(`Receipt fetch failed for ${txHash}`, err);
                }
                count--;
            }
        }
        catch (err) {
            console.log(`Chain ${chainId} processing error`, err);
        }
    }));
    await progressMutex.runExclusive(() => {
        progressMap.set(requestId, "done");
    });
    if (userDetails) {
        userDetails.ethLastBlock = ethLastBlock;
        userDetails.bscLastBlock = bscLastBlock;
        userDetails.arbLastBlock = arbLastBlock;
        userDetails.data = output;
        await em.persistAndFlush(userDetails);
    }
    else {
        const userDetails = new userDetails_1.UserDetails(walletAddress, ethLastBlock, bscLastBlock, arbLastBlock, output);
        await em.persistAndFlush(userDetails);
    }
    return output;
}
// OLD FUNCTION DO NOT REMOVE IT
// export async function getUserTransactions(em: EntityManager<IDatabaseDriver<Connection>>, walletAddress: string, progressMap: Map<string, any>, requestId: string) {
//   let output: {
//     [walletAddress: string]: {
//       [chainId: string]: {
//         [protocol: string]: {
//           [tokenSymbol: string]: {
//             totalDeposit: number;
//             totalWithdraw: number;
//           };
//         };
//       };
//     };
//   } = { [walletAddress]: {} };
//   const userDetails = await em.findOne(UserDetails, { walletAddress });
//   if (userDetails) {
//     output = userDetails.data;
//   }
//   let ethLastBlock = "0";
//   let bscLastBlock = "0";
//   let arbLastBlock = "0";
//   let endblock = "99999999"
//   for (const chainId in RPC_URLS) {
//     console.log(RPC_URLS[chainId]);
//     if (!RPC_URLS[chainId]) break;
//     if (!API_URLS[chainId]) break;
//     try {
//       const blockApi = await axios.get(`${API_URLS[chainId].apiUrl}?chainid=${chainId}&module=block&action=getblocknobytime&timestamp=${Math.floor(new Date().getTime() / 1000)}&closest=before&apikey=${API_URLS[chainId].apiKey}`);
//       endblock = blockApi.data.result
//       console.log(`latest block ${endblock} chain ${chainId}`);
//     }
//     catch (ex) {
//       console.log(`Error fetching latest block for chain ${chainId}`, ex);
//     }
//     const startBlock = userDetails ? chainId === "1" ? userDetails.ethLastBlock : chainId === "56" ? userDetails.bscLastBlock : chainId === "42161" ? userDetails.arbLastBlock : 0 : 0;
//     const provider = new ethers.JsonRpcProvider(RPC_URLS[chainId]); // or use Alchemy
//     const url = `${API_URLS[chainId].apiUrl}?chainid=${chainId}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endblock}&sort=desc&apikey=${API_URLS[chainId].apiKey}`;
//     const txs = await axios.get(url);
//     console.log("txs ", txs.data.result.length);
//     let count = txs.data.result.length;
//     for (const [index, tx] of txs.data.result.entries()) {
//       console.log({ count });
//       if (index === 0) {
//         if (chainId === "1") {
//           ethLastBlock = (Number(tx.blockNumber) + 1).toString();
//         }
//         else if (chainId === "56") {
//           bscLastBlock = (Number(tx.blockNumber) + 1).toString();
//         }
//         else if (chainId === "42161") {
//           arbLastBlock = (Number(tx.blockNumber) + 1).toString();
//         }
//       }
//       // progressMap.set(requestId as string, { bsc: "x" });
//       progressMap.set(requestId as string, {
//         ...(progressMap.get(requestId as string) || {}),
//         [CHAIN_ID_TO_NAME[chainId]]: count,
//       });
//       const entry = Object.entries(CONTRACTS[chainId]).find(
//         ([key]) =>
//           key.toLowerCase() === tx.to.toLowerCase() ||
//           CONTRACTS[chainId][key].native.toLowerCase() === tx.to.toLowerCase()
//       );
//       if (!entry) {
//         count--;
//         continue;
//       }
//       const txHash = tx.hash;
//       try {
//         const receipt = await provider.getTransactionReceipt(txHash);
//         for (const log of receipt.logs) {
//           try {
//             if (log) {
//               const contracts = CONTRACTS[chainId][log.address.toLowerCase()];
//               if (!contracts) continue;
//               const iface = new ethers.Interface(
//                 CONTRACTS_ABIS[contracts.protocol]
//               );
//               const decoded = iface.parseLog(log);
//               if (
//                 decoded &&
//                 (decoded.name === "Supply" ||
//                   decoded.name === "Deposit" ||
//                   decoded.name === "Mint")
//               ) {
//                 console.log("decoded", { txHash }, decoded);
//                 const entry = Object.entries(SUPPORTED_TOKENS_TO_MARKETS).find(
//                   ([key]) => key.toLowerCase() === decoded.args[0].toLowerCase()
//                 );
//                 // logic for compound contracts
//                 const token = entry
//                   ? entry[1]
//                   : contracts.protocol === "Compound" ||
//                     contracts.protocol === "Venus"
//                     ? { chainId: Number(chainId), market: contracts.nativeSymbol }
//                     : undefined;
//                 const symbol =
//                   contracts.protocol != "Venus"
//                     ? decoded.args[1].toLowerCase() ===
//                       contracts.native.toLowerCase()
//                       ? contracts.nativeSymbol
//                       : token.market
//                     : token.market;
//                 if (token) {
//                   if (!output[walletAddress][chainId]) {
//                     output[walletAddress][chainId] = {};
//                   }
//                   if (!output[walletAddress][chainId][contracts.protocol]) {
//                     output[walletAddress][chainId][contracts.protocol] = {};
//                   }
//                   if (
//                     output[walletAddress][chainId][contracts.protocol][symbol]
//                   ) {
//                     output[walletAddress][chainId][contracts.protocol][
//                       symbol
//                     ].totalDeposit += Number(
//                       decoded.args[
//                       contracts.protocol === "Compound"
//                         ? 2
//                         : contracts.protocol === "Venus"
//                           ? 1
//                           : 3
//                       ]
//                     );
//                   } else {
//                     output[walletAddress][chainId][contracts.protocol][symbol] =
//                     {
//                       totalDeposit: Number(
//                         decoded.args[
//                         contracts.protocol === "Compound"
//                           ? 2
//                           : contracts.protocol === "Venus"
//                             ? 1
//                             : 3
//                         ]
//                       ),
//                       totalWithdraw: 0
//                     };
//                   }
//                 }
//               } else if (
//                 decoded &&
//                 (decoded.name === "Withdraw" || decoded.name === "Redeem")
//               ) {
//                 // console.log("decoded", { txHash }, decoded);
//                 const entry = Object.entries(SUPPORTED_TOKENS_TO_MARKETS).find(
//                   ([key]) => key.toLowerCase() === decoded.args[0].toLowerCase()
//                 );
//                 const token = entry
//                   ? entry[1]
//                   : contracts.protocol === "Compound" ||
//                     contracts.protocol === "Venus"
//                     ? { chainId: Number(chainId), market: contracts.nativeSymbol }
//                     : undefined;
//                 const symbol =
//                   contracts.protocol != "Venus"
//                     ? decoded.args[1].toLowerCase() ===
//                       contracts.native.toLowerCase()
//                       ? contracts.nativeSymbol
//                       : token.market
//                     : token.market;
//                 if (token) {
//                   if (!output[walletAddress][chainId]) {
//                     output[walletAddress][chainId] = {};
//                   }
//                   if (!output[walletAddress][chainId][contracts.protocol]) {
//                     output[walletAddress][chainId][contracts.protocol] = {};
//                   }
//                   if (
//                     output[walletAddress][chainId][contracts.protocol][symbol]
//                   ) {
//                     output[walletAddress][chainId][contracts.protocol][
//                       symbol
//                     ].totalWithdraw += Number(
//                       decoded.args[
//                       contracts.protocol === "Compound"
//                         ? 2
//                         : contracts.protocol === "Venus"
//                           ? 1
//                           : 3
//                       ]
//                     );
//                   } else {
//                     output[walletAddress][chainId][contracts.protocol][symbol] =
//                     {
//                       totalDeposit: 0,
//                       totalWithdraw: Number(
//                         decoded.args[
//                         contracts.protocol === "Compound"
//                           ? 2
//                           : contracts.protocol === "Venus"
//                             ? 1
//                             : 3
//                         ]
//                       )
//                     };
//                   }
//                 }
//               }
//             }
//           } catch (err) {
//             console.log("err ", err);
//           }
//         }
//         if (!receipt) console.log("rec ", receipt);
//       } catch (err) {
//         console.error(`Failed to get receipt for ${txHash}`, err);
//       }
//       count--;
//     }
//   }
//   progressMap.set(requestId as string, "done");
//   console.dir(output, { depth: null, colors: true });
//   if (userDetails) {
//     userDetails.ethLastBlock = ethLastBlock === "0" ? userDetails.ethLastBlock : ethLastBlock;
//     userDetails.bscLastBlock = bscLastBlock === "0" ? userDetails.bscLastBlock : bscLastBlock;
//     userDetails.arbLastBlock = arbLastBlock === "0" ? userDetails.arbLastBlock : arbLastBlock;
//     userDetails.data = output;
//     await em.persistAndFlush(userDetails);
//   }
//   else {
//     let userDetails = new UserDetails(walletAddress, ethLastBlock, bscLastBlock, arbLastBlock, output);
//     await em.persistAndFlush(userDetails);
//   }
//   return output;
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRldGFpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXNlckRldGFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUF3T0Esa0RBME1DO0FBbGJELG1DQUFnQztBQUNoQyxrREFBMEI7QUFDMUIsMkNBQWdHO0FBRWhHLHNEQUFtRDtBQUNuRCw2Q0FBb0M7QUFDcEMsS0FBSyxVQUFVLFNBQVMsQ0FBSSxFQUFvQixFQUFFLE9BQU8sR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUs7SUFDNUUsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQztZQUNILElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDdEIsWUFBWTtZQUNaLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEtBQUssdUJBQXVCLEVBQUUsQ0FBQztnQkFDbkcsWUFBWTtnQkFDWixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQ0Qsb0NBQW9DO1lBQ3BDLHVEQUF1RDtZQUN2RCxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztJQUNILENBQUM7SUFDRCwwQ0FBMEM7QUFDNUMsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUE2QjtJQUMvQyxJQUFJLEVBQUU7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