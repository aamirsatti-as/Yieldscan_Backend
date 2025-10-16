import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { MikroORM } from "@mikro-orm/core";
import { SUPPORTED_TOKENS_TO_MARKETS } from "../constants";
import { Apy } from "../models/apy";
import { createAssetRoutes } from "../routes/assets";
import { createChainRoutes } from "../routes/chains";
import { createProtocolRoutes } from "../routes/protocols";
import { createDefinitionsRoutes } from "../routes/definitions";
import { createBackofficeRoutes } from "../routes/backoffice";
import { Definitions } from "../models/definitions";
// import { Protocol } from "../models/protocol";
import { protocols, definitions } from "../constants";
import { config } from "dotenv";
import { ethers } from "ethers";
import { getUserTransactions } from "../userDetails";

config();
const progressMap = new Map<string, any>();
const activeRequests = new Set<string>();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(cors());

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(process.cwd(), 'openapi.yaml'));

const startServer = async (orm: MikroORM) => {
  try {
    console.log("✅ Connected to MongoDB");
    console.log("🔧 Registering routes...");

    // OpenAPI Documentation
    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use('/swagger-custom.css', express.static(path.join(__dirname, '../../public/css/swagger-custom.css')));
    app.use('/swagger-custom.js', express.static(path.join(__dirname, '../../public/js/swagger-custom.js')));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customJs: '/swagger-custom.js',
      customCssUrl: '/swagger-custom.css'
    }));
    app.use('/openapi.yaml', express.static(path.join(process.cwd(), 'openapi.yaml')));

    // API routes first (more specific routes)
    app.use("/api/assets", createAssetRoutes(orm));
    app.use("/api/chains", createChainRoutes(orm));
    app.use("/api/protocols", createProtocolRoutes(orm));
    app.use(express.json());
    app.use("/api/definitions", createDefinitionsRoutes(orm));

    console.log("✅ API routes registered");

    //@ts-ignore
    // SSE stream endpoint
    app.get('/api/long-task/progress', (req, res) => {
      const requestId = req.query.requestId;
      if (!requestId) return res.status(400).end();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Cache-Control', 'no-cache');

      const interval = setInterval(() => {
        const progress = progressMap.get(requestId as string);
        if (progress === "done") {
          clearInterval(interval);
          progressMap.delete(requestId as string);
          res.write(`data: done\n\n`);
          res.end();
        } else {
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      }, 500);
    });


    // APY data endpoint
    //@ts-ignore
    app.get("/api/apy", async (req, res) => {
      const output = {};
      for (const [tokenAddress, { chainId }] of Object.entries(
        SUPPORTED_TOKENS_TO_MARKETS
      )) {
        const key = chainId.toString();
        const compoundApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Compound" },
          { orderBy: { createdAt: "desc" } }
        );
        const aveApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Aave" },
          { orderBy: { createdAt: "desc" } }
        );
        const radiantApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Radiant" },
          { orderBy: { createdAt: "desc" } }
        );
        const venusApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Venus" },
          { orderBy: { createdAt: "desc" } }
        );
        const fluidApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Fluid" },
          { orderBy: { createdAt: "desc" } }
        );
        const rocketPoolApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "RocketPool" },
          { orderBy: { createdAt: "desc" } }
        );
        const lidoApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Lido" },
          { orderBy: { createdAt: "desc" } }
        );
        const morphoApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Morpho" },
          { orderBy: { createdAt: "desc" } }
        );
        const dolomiteApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Dolomite" },
          { orderBy: { createdAt: "desc" } }
        );
        const eulerApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Euler" },
          { orderBy: { createdAt: "desc" } }
        );
        const fluxFinanceApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Flux Finance" },
          { orderBy: { createdAt: "desc" } }
        );
        const sparklendApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Sparklend" },
          { orderBy: { createdAt: "desc" } }
        );
        const zerolendApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Zerolend" },
          { orderBy: { createdAt: "desc" } }
        );
        const kinzaFinanceApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Kinza Finance" },
          { orderBy: { createdAt: "desc" } }
        );
        const ethenaApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Ethena" },
          { orderBy: { createdAt: "desc" } }
        );
        const creamFinanceApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Cream Finance" },
          { orderBy: { createdAt: "desc" } }
        );
        const mapleApy = await orm.em.findOne(
          Apy,
          { tokenAddress: new RegExp(tokenAddress, "i"), type: "Maple" },
          { orderBy: { createdAt: "desc" } }
        );
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
        if (
          tokenData.aave === undefined &&
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
          tokenData.creamfinance === undefined
        ) {
          //@ts-ignore
          output[key][ethers.isAddress(tokenAddress) ? tokenAddress : "0x"] =
            undefined;
        } else {
          //@ts-ignore
          output[key][ethers.isAddress(tokenAddress) ? tokenAddress : "0x"] =
            tokenData;
        }
      }

      // console.log(output);

      res.json(output);
    });

    //@ts-ignore
    app.get("/api/user-details/:walletAddress", async (req, res) => {
      const requestId = req.query.requestId;
      if (!requestId) return res.status(400).json({ error: 'Missing requestId' });

      const walletAddress = req.params.walletAddress?.toLowerCase();
      if (!walletAddress) return res.status(400).json({ error: "Missing wallet address" });

      if (activeRequests.has(walletAddress)) {
        return res.status(429).json({ error: "Request already in progress for this wallet" });
      }

      activeRequests.add(walletAddress);

      try {
        const data = await getUserTransactions(
          orm.em.fork(),
          walletAddress,
          progressMap,
          requestId as string
        );

        res.json(data);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
      } finally {
        activeRequests.delete(walletAddress);
      }
    });

    app.post('/api/protocols-and-definitions', async (_, res: any) => {
      try {
        if (!Array.isArray(protocols) || !Array.isArray(definitions)) {
          return res.status(400).json({ error: "Invalid payload format" });
        }

        const normalizeDocs = (docs: any[]) =>
          docs.map(({ _id, ...rest }) => {
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

        console.log('normalizeDocs ', normalizeDocs)

        if (definitions.length) {
          for (const data of normalizeDocs(definitions)) {
            if (!data.protocol || !data?.protocol) continue;
            console.log('pro ',data.protocol)
            const entity = orm.em.create(Definitions, data);
            orm.em.persist(entity);
          }
        }

        await orm.em.flush();

        return res.json({
          message: "Records inserted successfully",
        });
      } catch (err: any) {
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
    app.use("/backoffice", createBackofficeRoutes());

    console.log("✅ Backoffice routes registered");

    // Root redirect
    app.get("/", (_req, res) => {
      console.log("📍 Root route hit - redirecting to /backoffice/assets");
      res.redirect('/backoffice/assets');
    });

    // Serve static files only for specific paths to avoid conflicts
    app.use("/js", express.static(path.join(__dirname, '../../public/js')));
    app.use("/css", express.static(path.join(__dirname, '../../public/css')));
    app.use("/images", express.static(path.join(__dirname, '../../public/images')));
    app.use("/assets", express.static(path.join(__dirname, '../../public/assets')));
    app.use("/chains", express.static(path.join(__dirname, '../../public/chains')));
    app.use("/protocols", express.static(path.join(__dirname, '../../public/protocols')));
    console.log("✅ Static file middleware registered");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 OpenAPI Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

export default startServer;
