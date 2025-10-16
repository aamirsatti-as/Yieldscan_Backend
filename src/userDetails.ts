import { ethers } from "ethers";
import axios from "axios";
import { API_URLS, CHAIN_ID_TO_NAME, RPC_URLS, SUPPORTED_TOKENS_TO_MARKETS } from "./constants";
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { UserDetails } from "./models/userDetails";
import { Mutex } from "async-mutex";
async function withRetry<T>(fn: () => Promise<T>, delayMs = 2000, type = "api"): Promise<T> {
  while (true) {
    try {
      let data = await fn();
      //@ts-ignore
      if (type == "api" && data.data?.message !== "OK" && data.data?.message !== "No transactions found") {
        //@ts-ignore
        throw new Error(data.data);
      }
      return data;
    } catch (err) {
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

const CONTRACTS_ABIS: Record<string, string[]> = {
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
const CONTRACTS: Record<
  number,
  Record<string, { native: string; nativeSymbol: string; protocol: string, yieldbearingToken?: string }>
> = {
  1: {
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {
      native: "0xd01607c3c5ecaba394d8be377a08590149325722",
      // native: "0x78f8bd884c3d738b74b420540659c82f392820e0",
      nativeSymbol: "ETH",
      protocol: "Aave",
      yieldbearingToken: "0x78f8bd884c3d738b74b420540659c82f392820e0"
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

export async function getUserTransactions(
  em: EntityManager<IDatabaseDriver<Connection>>,
  walletAddress: string,
  progressMap: Map<string, any>,
  requestId: string
) {
  const output: {
    [walletAddress: string]: {
      [chainId: string]: {
        [protocol: string]: {
          [tokenSymbol: string]: {
            totalDeposit: number;
            totalWithdraw: number;
          };
        };
      };
    };
  } = { [walletAddress]: {} };

  const outputMutex = new Mutex();
  const progressMutex = new Mutex();

  const userDetails = await em.findOne(UserDetails, { walletAddress });
  if (userDetails?.data?.[walletAddress]) {
    Object.assign(output[walletAddress], userDetails.data[walletAddress]);
  }

  let ethLastBlock = userDetails?.ethLastBlock ?? "0";
  let bscLastBlock = userDetails?.bscLastBlock ?? "0";
  let arbLastBlock = userDetails?.arbLastBlock ?? "0";

  await Promise.all(
    Object.keys(RPC_URLS).map(async (id) => {
      let chainId = Number(id);
      if (!RPC_URLS[chainId] || !API_URLS[chainId]) return;

      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const blockUrl = `${API_URLS[chainId].apiUrl}?chainid=${chainId}&module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${API_URLS[chainId].apiKey}`;
        const blockApi = await withRetry(() => axios.get(blockUrl));

        const endblock = blockApi.data.result;

        const startBlock =
          chainId === 1
            ? ethLastBlock
            : chainId === 56
              ? bscLastBlock
              : chainId === 42161
                ? arbLastBlock
                : "0";

        const provider = new ethers.JsonRpcProvider(RPC_URLS[chainId]);
        const url = `${API_URLS[chainId].apiUrl}?chainid=${chainId}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endblock}&sort=desc&apikey=${API_URLS[chainId].apiKey}`;
        const txs = await withRetry(() => axios.get(url));


        const txList = txs.data.result;
        let count = txList.length;

        if (count === 0) {
          if (chainId === 1) ethLastBlock = endblock;
          if (chainId === 56) bscLastBlock = endblock;
          if (chainId === 42161) arbLastBlock = endblock;
        }
        for (const [index, tx] of txList.entries()) {
          if (index === 0 && tx?.blockNumber) {
            const nextBlock = (Number(tx.blockNumber) + 1).toString();
            if (chainId === 1) ethLastBlock = nextBlock;
            if (chainId === 56) bscLastBlock = nextBlock;
            if (chainId === 42161) arbLastBlock = nextBlock;
          }

          await progressMutex.runExclusive(() => {
            const current = progressMap.get(requestId) || {};
            progressMap.set(requestId, {
              ...current,
              [CHAIN_ID_TO_NAME[chainId]]: count,
            });
          });

          const entry = Object.entries(CONTRACTS[chainId]).find(
            ([key]) =>
              key.toLowerCase() === tx.to?.toLowerCase() ||
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
            if (!receipt) continue;

            for (const log of receipt.logs) {
              const contracts = CONTRACTS[chainId][log.address.toLowerCase()];
              if (!contracts) continue;

              try {
                const iface = new ethers.Interface(CONTRACTS_ABIS[contracts.protocol]);
                const decoded = iface.parseLog(log);
                console.log({ decoded, txHash });

                if (!decoded) continue;

                const isDeposit = ["Supply", "Deposit", "Mint", "LogOperate"].includes(decoded.name);
                const isWithdraw = ["Withdraw", "Redeem", "LogOperate"].includes(decoded.name);
                if (!isDeposit && !isWithdraw) continue;

                const tokenEntry = Object.entries(SUPPORTED_TOKENS_TO_MARKETS).find(
                  ([key]) => contracts.protocol === "Fluid" ? key.toLowerCase() === decoded.args[1]?.toLowerCase() : key.toLowerCase() === decoded.args[0]?.toLowerCase()
                );
                const token = tokenEntry?.[1] ??
                  ((contracts.protocol === "Compound" || contracts.protocol === "Venus" || contracts.protocol === "Morpho") && {
                    chainId: Number(chainId),
                    market: contracts.nativeSymbol,
                  });

                const symbol =
                  contracts.protocol !== "Venus"
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
                    } else {
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

                if (!token || !symbol || isNaN(value)) continue;

                await outputMutex.runExclusive(() => {
                  output[walletAddress][chainId] ??= {};
                  output[walletAddress][chainId][contracts.protocol] ??= {};
                  output[walletAddress][chainId][contracts.protocol][symbol] ??= {
                    totalDeposit: 0,
                    totalWithdraw: 0,
                  };

                  if (isDeposit && value > 0) {
                    output[walletAddress][chainId][contracts.protocol][symbol].totalDeposit += value;
                  } else if (isWithdraw) {
                    output[walletAddress][chainId][contracts.protocol][symbol].totalWithdraw += Math.abs(value);
                  }
                });
              } catch (err) {
                console.log("Log parse error:", { chainId, txHash, walletAddress }, err);
              }
            }
          } catch (err) {
            console.log(`Receipt fetch failed for ${txHash}`, err);
          }

          count--;
        }
      } catch (err) {
        console.log(`Chain ${chainId} processing error`, err);
      }
    })
  );

  await progressMutex.runExclusive(() => {
    progressMap.set(requestId, "done");
  });

  if (userDetails) {
    userDetails.ethLastBlock = ethLastBlock;
    userDetails.bscLastBlock = bscLastBlock;
    userDetails.arbLastBlock = arbLastBlock;
    userDetails.data = output;
    await em.persistAndFlush(userDetails);
  } else {
    const userDetails = new UserDetails(
      walletAddress,
      ethLastBlock,
      bscLastBlock,
      arbLastBlock,
      output
    );
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