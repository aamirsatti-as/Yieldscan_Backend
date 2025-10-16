"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const constants_1 = require("../constants");
const apy_1 = require("../models/apy");
const assets_1 = require("../routes/assets");
const chains_1 = require("../routes/chains");
const protocols_1 = require("../routes/protocols");
const definitions_1 = require("../routes/definitions");
const backoffice_1 = require("../routes/backoffice");
const definitions_2 = require("../models/definitions");
// import { Protocol } from "../models/protocol";
const constants_2 = require("../constants");
const dotenv_1 = require("dotenv");
const ethers_1 = require("ethers");
const userDetails_1 = require("../userDetails");
(0, dotenv_1.config)();
const progressMap = new Map();
const activeRequests = new Set();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.use((0, cors_1.default)());
// Load OpenAPI specification
const swaggerDocument = yamljs_1.default.load(path_1.default.join(process.cwd(), 'openapi.yaml'));
const startServer = async (orm) => {
    try {
        console.log("✅ Connected to MongoDB");
        console.log("🔧 Registering routes...");
        // OpenAPI Documentation
        // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        app.use('/swagger-custom.css', express_1.default.static(path_1.default.join(__dirname, '../../public/css/swagger-custom.css')));
        app.use('/swagger-custom.js', express_1.default.static(path_1.default.join(__dirname, '../../public/js/swagger-custom.js')));
        app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
            customJs: '/swagger-custom.js',
            customCssUrl: '/swagger-custom.css'
        }));
        app.use('/openapi.yaml', express_1.default.static(path_1.default.join(process.cwd(), 'openapi.yaml')));
        // API routes first (more specific routes)
        app.use("/api/assets", (0, assets_1.createAssetRoutes)(orm));
        app.use("/api/chains", (0, chains_1.createChainRoutes)(orm));
        app.use("/api/protocols", (0, protocols_1.createProtocolRoutes)(orm));
        app.use(express_1.default.json());
        app.use("/api/definitions", (0, definitions_1.createDefinitionsRoutes)(orm));
        console.log("✅ API routes registered");
        //@ts-ignore
        // SSE stream endpoint
        app.get('/api/long-task/progress', (req, res) => {
            const requestId = req.query.requestId;
            if (!requestId)
                return res.status(400).end();
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Cache-Control', 'no-cache');
            const interval = setInterval(() => {
                const progress = progressMap.get(requestId);
                if (progress === "done") {
                    clearInterval(interval);
                    progressMap.delete(requestId);
                    res.write(`data: done\n\n`);
                    res.end();
                }
                else {
                    res.write(`data: ${JSON.stringify(progress)}\n\n`);
                }
            }, 500);
        });
        // APY data endpoint
        //@ts-ignore
        app.get("/api/apy", async (req, res) => {
            const output = {};
            for (const [tokenAddress, { chainId }] of Object.entries(constants_1.SUPPORTED_TOKENS_TO_MARKETS)) {
                const key = chainId.toString();
                const compoundApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Compound" }, { orderBy: { createdAt: "desc" } });
                const aveApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Aave" }, { orderBy: { createdAt: "desc" } });
                const radiantApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Radiant" }, { orderBy: { createdAt: "desc" } });
                const venusApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Venus" }, { orderBy: { createdAt: "desc" } });
                const fluidApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Fluid" }, { orderBy: { createdAt: "desc" } });
                const rocketPoolApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "RocketPool" }, { orderBy: { createdAt: "desc" } });
                const lidoApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Lido" }, { orderBy: { createdAt: "desc" } });
                const morphoApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Morpho" }, { orderBy: { createdAt: "desc" } });
                const dolomiteApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Dolomite" }, { orderBy: { createdAt: "desc" } });
                const eulerApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Euler" }, { orderBy: { createdAt: "desc" } });
                const fluxFinanceApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Flux Finance" }, { orderBy: { createdAt: "desc" } });
                const sparklendApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Sparklend" }, { orderBy: { createdAt: "desc" } });
                const zerolendApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Zerolend" }, { orderBy: { createdAt: "desc" } });
                const kinzaFinanceApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Kinza Finance" }, { orderBy: { createdAt: "desc" } });
                const ethenaApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Ethena" }, { orderBy: { createdAt: "desc" } });
                const creamFinanceApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Cream Finance" }, { orderBy: { createdAt: "desc" } });
                const mapleApy = await orm.em.findOne(apy_1.Apy, { tokenAddress: new RegExp(tokenAddress, "i"), type: "Maple" }, { orderBy: { createdAt: "desc" } });
                // console.log('fluidApy ', dolomiteApy, tokenAddress, Euler)
                const tokenData = {
                    compound: compoundApy
                        ? Number(compoundApy.apy)
                            ? Number(compoundApy.apy)
                            : undefined
                        : undefined,
                    aave: aveApy
                        ? Number(aveApy.apy)
                            ? Number(aveApy.apy)
                            : undefined
                        : undefined,
                    radiant: radiantApy
                        ? Number(radiantApy.apy)
                            ? Number(radiantApy.apy)
                            : undefined
                        : undefined,
                    venus: venusApy
                        ? Number(venusApy.apy)
                            ? Number(venusApy.apy)
                            : undefined
                        : undefined,
                    fluid: fluidApy
                        ? Number(fluidApy.apy)
                            ? Number(fluidApy.apy)
                            : undefined
                        : undefined,
                    rocketpool: rocketPoolApy
                        ? Number(rocketPoolApy.apy)
                            ? Number(rocketPoolApy.apy)
                            : undefined
                        : undefined,
                    lido: lidoApy
                        ? Number(lidoApy.apy)
                            ? Number(lidoApy.apy)
                            : undefined
                        : undefined,
                    morpho: morphoApy
                        ? Number(morphoApy.apy)
                            ? Number(morphoApy.apy)
                            : undefined
                        : undefined,
                    dolomite: dolomiteApy
                        ? Number(dolomiteApy.apy)
                            ? Number(dolomiteApy.apy)
                            : undefined
                        : undefined,
                    euler: eulerApy
                        ? Number(eulerApy.apy)
                            ? Number(eulerApy.apy)
                            : undefined
                        : undefined,
                    fluxfinance: fluxFinanceApy
                        ? Number(fluxFinanceApy.apy)
                            ? Number(fluxFinanceApy.apy)
                            : undefined
                        : undefined,
                    sparklend: sparklendApy
                        ? Number(sparklendApy.apy)
                            ? Number(sparklendApy.apy)
                            : undefined
                        : undefined,
                    zerolend: zerolendApy
                        ? Number(zerolendApy.apy)
                            ? Number(zerolendApy.apy)
                            : undefined
                        : undefined,
                    kinzafinance: kinzaFinanceApy
                        ? Number(kinzaFinanceApy.apy)
                            ? Number(kinzaFinanceApy.apy)
                            : undefined
                        : undefined,
                    ethena: ethenaApy
                        ? Number(ethenaApy.apy)
                            ? Number(ethenaApy.apy)
                            : undefined
                        : undefined,
                    creamfinance: creamFinanceApy
                        ? Number(creamFinanceApy.apy)
                            ? Number(creamFinanceApy.apy)
                            : undefined
                        : undefined,
                    maple: mapleApy
                        ? Number(mapleApy.apy)
                            ? Number(mapleApy.apy)
                            : undefined
                        : undefined,
                };
                //@ts-ignore
                if (!output[key]) {
                    //@ts-ignore
                    output[key] = {};
                }
                [];
                if (tokenData.aave === undefined &&
                    tokenData.compound === undefined &&
                    tokenData.radiant === undefined &&
                    tokenData.venus === undefined &&
                    tokenData.fluid === undefined &&
                    tokenData.rocketpool === undefined &&
                    tokenData.lido === undefined &&
                    tokenData.morpho === undefined &&
                    tokenData.dolomite === undefined &&
                    tokenData.euler === undefined &&
                    tokenData.fluxfinance === undefined &&
                    tokenData.zerolend === undefined &&
                    tokenData.sparklend === undefined &&
                    tokenData.kinzafinance === undefined &&
                    tokenData.ethena === undefined &&
                    tokenData.creamfinance === undefined) {
                    //@ts-ignore
                    output[key][ethers_1.ethers.isAddress(tokenAddress) ? tokenAddress : "0x"] =
                        undefined;
                }
                else {
                    //@ts-ignore
                    output[key][ethers_1.ethers.isAddress(tokenAddress) ? tokenAddress : "0x"] =
                        tokenData;
                }
            }
            // console.log(output);
            res.json(output);
        });
        //@ts-ignore
        app.get("/api/user-details/:walletAddress", async (req, res) => {
            const requestId = req.query.requestId;
            if (!requestId)
                return res.status(400).json({ error: 'Missing requestId' });
            const walletAddress = req.params.walletAddress?.toLowerCase();
            if (!walletAddress)
                return res.status(400).json({ error: "Missing wallet address" });
            if (activeRequests.has(walletAddress)) {
                return res.status(429).json({ error: "Request already in progress for this wallet" });
            }
            activeRequests.add(walletAddress);
            try {
                const data = await (0, userDetails_1.getUserTransactions)(orm.em.fork(), walletAddress, progressMap, requestId);
                res.json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: "Internal error" });
            }
            finally {
                activeRequests.delete(walletAddress);
            }
        });
        app.post('/api/protocols-and-definitions', async (_, res) => {
            try {
                if (!Array.isArray(constants_2.protocols) || !Array.isArray(constants_2.definitions)) {
                    return res.status(400).json({ error: "Invalid payload format" });
                }
                const normalizeDocs = (docs) => docs.map(({ _id, ...rest }) => {
                    if (_id?.$oid) {
                        return { id: _id.$oid, ...rest }; // MikroORM expects `id` not `_id`
                    }
                    return rest;
                });
                // if (protocols.length) {
                //   for (const data of normalizeDocs(protocols)) {
                //     const entity = orm.em.create(Protocol, data);
                //     orm.em.persist(entity);
                //   }
                // }
                console.log('normalizeDocs ', normalizeDocs);
                if (constants_2.definitions.length) {
                    for (const data of normalizeDocs(constants_2.definitions)) {
                        if (!data.protocol || !data?.protocol)
                            continue;
                        console.log('pro ', data.protocol);
                        const entity = orm.em.create(definitions_2.Definitions, data);
                        orm.em.persist(entity);
                    }
                }
                await orm.em.flush();
                return res.json({
                    message: "Records inserted successfully",
                });
            }
            catch (err) {
                console.error("Error inserting records:", err);
                return res.status(500).json({ error: "Failed to insert records" });
            }
        });
        // Backoffice routes (using modular approach)
        console.log("🔧 Registering backoffice routes...");
        // Add debugging middleware to see what's happening
        app.use("/backoffice", (req, _res, next) => {
            console.log(`🔍 Backoffice route hit: ${req.method} ${req.path}`);
            next();
        });
        // Mount the actual backoffice routes
        app.use("/backoffice", (0, backoffice_1.createBackofficeRoutes)());
        console.log("✅ Backoffice routes registered");
        // Root redirect
        app.get("/", (_req, res) => {
            console.log("📍 Root route hit - redirecting to /backoffice/assets");
            res.redirect('/backoffice/assets');
        });
        // Serve static files only for specific paths to avoid conflicts
        app.use("/js", express_1.default.static(path_1.default.join(__dirname, '../../public/js')));
        app.use("/css", express_1.default.static(path_1.default.join(__dirname, '../../public/css')));
        app.use("/images", express_1.default.static(path_1.default.join(__dirname, '../../public/images')));
        app.use("/assets", express_1.default.static(path_1.default.join(__dirname, '../../public/assets')));
        app.use("/chains", express_1.default.static(path_1.default.join(__dirname, '../../public/chains')));
        app.use("/protocols", express_1.default.static(path_1.default.join(__dirname, '../../public/protocols')));
        console.log("✅ Static file middleware registered");
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 OpenAPI Documentation available at http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        console.error("❌ Failed to connect to MongoDB", error);
        process.exit(1);
    }
};
exports.default = startServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQThCO0FBQzlCLGdEQUF3QjtBQUN4QixnREFBd0I7QUFDeEIsNEVBQTJDO0FBQzNDLG9EQUEwQjtBQUUxQiw0Q0FBMkQ7QUFDM0QsdUNBQW9DO0FBQ3BDLDZDQUFxRDtBQUNyRCw2Q0FBcUQ7QUFDckQsbURBQTJEO0FBQzNELHVEQUFnRTtBQUNoRSxxREFBOEQ7QUFDOUQsdURBQW9EO0FBQ3BELGlEQUFpRDtBQUNqRCw0Q0FBc0Q7QUFDdEQsbUNBQWdDO0FBQ2hDLG1DQUFnQztBQUNoQyxnREFBcUQ7QUFFckQsSUFBQSxlQUFNLEdBQUUsQ0FBQztBQUNULE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7QUFDM0MsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztBQUN6QyxNQUFNLEdBQUcsR0FBRyxJQUFBLGlCQUFPLEdBQUUsQ0FBQztBQUN0QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDOUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGNBQUksR0FBRSxDQUFDLENBQUM7QUFFaEIsNkJBQTZCO0FBQzdCLE1BQU0sZUFBZSxHQUFHLGdCQUFJLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFFNUUsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLEdBQWEsRUFBRSxFQUFFO0lBQzFDLElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFFeEMsd0JB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QUNuQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUQsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUNuQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUQsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLGFBQWEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUN4QyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsRUFDbkUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUNsQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFDN0QsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUNwQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFDL0QsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFdBQVcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUN0QyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDakUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUNuQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUQsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLGNBQWMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUN6QyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsRUFDckUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFlBQVksR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUN2QyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsRUFDbEUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFdBQVcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUN0QyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDakUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLGVBQWUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUMxQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFDdEUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUNwQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFDL0QsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLGVBQWUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUMxQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFDdEUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUNuQyxTQUFHLEVBQ0gsRUFBRSxZQUFZLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUQsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRiw2REFBNkQ7Z0JBQzdELE1BQU0sU0FBUyxHQUFHO29CQUNoQixRQUFRLEVBQUUsV0FBVzt3QkFDbkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDOzRCQUN2QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7NEJBQ3pCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO29CQUNiLElBQUksRUFBRSxNQUFNO3dCQUNWLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQzs0QkFDbEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDOzRCQUNwQixDQUFDLENBQUMsU0FBUzt3QkFDYixDQUFDLENBQUMsU0FBUztvQkFDYixPQUFPLEVBQUUsVUFBVTt3QkFDakIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDOzRCQUN0QixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7NEJBQ3hCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO29CQUNiLEtBQUssRUFBRSxRQUFRO3dCQUNiLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQzs0QkFDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUN0QixDQUFDLENBQUMsU0FBUzt3QkFDYixDQUFDLENBQUMsU0FBUztvQkFDYixLQUFLLEVBQUUsUUFBUTt3QkFDYixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7NEJBQ3BCLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQzs0QkFDdEIsQ0FBQyxDQUFDLFNBQVM7d0JBQ2IsQ0FBQyxDQUFDLFNBQVM7b0JBQ2IsVUFBVSxFQUFFLGFBQWE7d0JBQ3ZCLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQzs0QkFDekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDOzRCQUMzQixDQUFDLENBQUMsU0FBUzt3QkFDYixDQUFDLENBQUMsU0FBUztvQkFDYixJQUFJLEVBQUUsT0FBTzt3QkFDWCxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7NEJBQ25CLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQzs0QkFDckIsQ0FBQyxDQUFDLFNBQVM7d0JBQ2IsQ0FBQyxDQUFDLFNBQVM7b0JBQ2IsTUFBTSxFQUFFLFNBQVM7d0JBQ2YsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzRCQUNyQixDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7NEJBQ3ZCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO29CQUNiLFFBQVEsRUFBRSxXQUFXO3dCQUNuQixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7NEJBQ3ZCLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQzs0QkFDekIsQ0FBQyxDQUFDLFNBQVM7d0JBQ2IsQ0FBQyxDQUFDLFNBQVM7b0JBQ2IsS0FBSyxFQUFFLFFBQVE7d0JBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7NEJBQ3RCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO29CQUNiLFdBQVcsRUFBRSxjQUFjO3dCQUN6QixDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7NEJBQzFCLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQzs0QkFDNUIsQ0FBQyxDQUFDLFNBQVM7d0JBQ2IsQ0FBQyxDQUFDLFNBQVM7b0JBQ2IsU0FBUyxFQUFFLFlBQVk7d0JBQ3JCLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQzs0QkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDOzRCQUMxQixDQUFDLENBQUMsU0FBUzt3QkFDYixDQUFDLENBQUMsU0FBUztvQkFDYixRQUFRLEVBQUUsV0FBVzt3QkFDbkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDOzRCQUN2QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7NEJBQ3pCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO29CQUNiLFlBQVksRUFBRSxlQUFlO3dCQUMzQixDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7NEJBQzNCLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQzs0QkFDN0IsQ0FBQyxDQUFDLFNBQVM7d0JBQ2IsQ0FBQyxDQUFDLFNBQVM7b0JBQ2IsTUFBTSxFQUFFLFNBQVM7d0JBQ2YsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzRCQUNyQixDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7NEJBQ3ZCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO29CQUNiLFlBQVksRUFBRSxlQUFlO3dCQUMzQixDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7NEJBQzNCLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQzs0QkFDN0IsQ0FBQyxDQUFDLFNBQVM7d0JBQ2IsQ0FBQyxDQUFDLFNBQVM7b0JBQ2IsS0FBSyxFQUFFLFFBQVE7d0JBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7NEJBQ3RCLENBQUMsQ0FBQyxTQUFTO3dCQUNiLENBQUMsQ0FBQyxTQUFTO2lCQUNkLENBQUM7Z0JBRUYsWUFBWTtnQkFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2pCLFlBQVk7b0JBQ1osTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQztnQkFDRCxFQUFFLENBQUM7Z0JBQ0gsSUFDRSxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVM7b0JBQzVCLFNBQVMsQ0FBQyxRQUFRLEtBQUssU0FBUztvQkFDaEMsU0FBUyxDQUFDLE9BQU8sS0FBSyxTQUFTO29CQUMvQixTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVM7b0JBQzdCLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUztvQkFDN0IsU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTO29CQUNsQyxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVM7b0JBQzVCLFNBQVMsQ0FBQyxNQUFNLEtBQUssU0FBUztvQkFDOUIsU0FBUyxDQUFDLFFBQVEsS0FBSyxTQUFTO29CQUNoQyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVM7b0JBQzdCLFNBQVMsQ0FBQyxXQUFXLEtBQUssU0FBUztvQkFDbkMsU0FBUyxDQUFDLFFBQVEsS0FBSyxTQUFTO29CQUNoQyxTQUFTLENBQUMsU0FBUyxLQUFLLFNBQVM7b0JBQ2pDLFNBQVMsQ0FBQyxZQUFZLEtBQUssU0FBUztvQkFDcEMsU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTO29CQUM5QixTQUFTLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFDcEMsQ0FBQztvQkFDRCxZQUFZO29CQUNaLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDL0QsU0FBUyxDQUFDO2dCQUNkLENBQUM7cUJBQU0sQ0FBQztvQkFDTixZQUFZO29CQUNaLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDL0QsU0FBUyxDQUFDO2dCQUNkLENBQUM7WUFDSCxDQUFDO1lBRUQsdUJBQXVCO1lBRXZCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZO1FBQ1osR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzdELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzlELElBQUksQ0FBQyxhQUFhO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBRXJGLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLDZDQUE2QyxFQUFFLENBQUMsQ0FBQztZQUN4RixDQUFDO1lBRUQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLGlDQUFtQixFQUNwQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUNiLGFBQWEsRUFDYixXQUFXLEVBQ1gsU0FBbUIsQ0FDcEIsQ0FBQztnQkFFRixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pCLENBQUM7WUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUNwRCxDQUFDO29CQUFTLENBQUM7Z0JBQ1QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBUSxFQUFFLEVBQUU7WUFDL0QsSUFBSSxDQUFDO2dCQUNILElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsdUJBQVcsQ0FBQyxFQUFFLENBQUM7b0JBQzdELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDO2dCQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBVyxFQUFFLEVBQUUsQ0FDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUUsRUFBRTtvQkFDNUIsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUM7d0JBQ2QsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxrQ0FBa0M7b0JBQ3RFLENBQUM7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBRUwsMEJBQTBCO2dCQUMxQixtREFBbUQ7Z0JBQ25ELG9EQUFvRDtnQkFDcEQsOEJBQThCO2dCQUM5QixNQUFNO2dCQUNOLElBQUk7Z0JBRUosT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQTtnQkFFNUMsSUFBSSx1QkFBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN2QixLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsQ0FBQyx1QkFBVyxDQUFDLEVBQUUsQ0FBQzt3QkFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUTs0QkFBRSxTQUFTO3dCQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7d0JBQ2pDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLHlCQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ2hELEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN6QixDQUFDO2dCQUNILENBQUM7Z0JBRUQsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUVyQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ2QsT0FBTyxFQUFFLCtCQUErQjtpQkFDekMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQy9DLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUdILDZDQUE2QztRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFFbkQsbURBQW1EO1FBQ25ELEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7UUFFSCxxQ0FBcUM7UUFDckMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBQSxtQ0FBc0IsR0FBRSxDQUFDLENBQUM7UUFFakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBRTlDLGdCQUFnQjtRQUNoQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDckUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsZ0VBQWdFO1FBQ2hFLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVuRCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMseUNBQXlDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsSUFBSSxXQUFXLENBQUMsQ0FBQztRQUN6RixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7QUFDSCxDQUFDLENBQUM7QUFFRixrQkFBZSxXQUFXLENBQUMifQ==