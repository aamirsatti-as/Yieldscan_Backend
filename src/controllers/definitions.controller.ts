import { MikroORM } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Definitions } from "../models/definitions";
import { Asset } from "../models/asset";
import { Protocol } from "../models/protocol";

export class DefinitionsController {
  constructor(private orm: MikroORM) { }

  create = async (req: Request, res: Response) => {
    try {
      const { assetId, apy, withdraw, deposit, protocolId, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri } = req.body;

      if (!assetId || !apy || !withdraw || !deposit || !protocolId) {
        return res.status(400).json({
          error: "Missing required fields: assetId, apy, withdraw, deposit, protocolId"
        });
      }

      const em = this.orm.em.fork();

      // Check if asset exists
      const asset = await em.findOne(Asset, assetId);
      const protocol = await em.findOne(Protocol, protocolId);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      if (!protocol) {
        return res.status(404).json({ error: "Protocol not found" });
      }

      // Check if definition already exists for this asset
      const existingDefinition = await em.findOne(Definitions, { asset: assetId, protocol: protocol });
      if (existingDefinition) {
        return res.status(409).json({
          error: "Definition already exists",
          message: `A definition for this asset already exists. Only one definition per asset is allowed.`
        });
      }

      const definitions = new Definitions(asset, protocol, apy, withdraw, deposit, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri);
      await em.persistAndFlush(definitions);

      res.status(201).json(definitions);
    } catch (error) {
      console.error("Error creating definitions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const { page, limit, search, assetId } = req.query;

      // Parse pagination parameters
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;

      // Validate pagination parameters
      if (pageNumber < 1) {
        return res.status(400).json({
          error: "Page number must be greater than 0"
        });
      }

      if (limitNumber < 1 || limitNumber > 100) {
        return res.status(400).json({
          error: "Limit must be between 1 and 100"
        });
      }

      const em = this.orm.em.fork();

      // Build filters
      const filters: any = {};

      // Asset filter
      if (assetId) {
        filters.asset = assetId;
      }

      // Search filter - search by asset symbol
      let searchFilters: any = {};
      if (search) {
        // We need to find assets that match the search term first
        const matchingAssets = await em.find(Asset, {
          symbol: new RegExp(search as string, 'i')
        });

        if (matchingAssets.length > 0) {
          const assetIds = matchingAssets.map(asset => asset._id);
          searchFilters.asset = { $in: assetIds };
        } else {
          // If no assets match, return empty results
          return res.json({
            definitions: [],
            pagination: {
              currentPage: pageNumber,
              totalPages: 0,
              totalCount: 0,
              hasNextPage: false,
              hasPrevPage: pageNumber > 1,
              limit: limitNumber
            }
          });
        }
      }

      // Combine filters
      const finalFilters = { ...filters, ...searchFilters };

      // Calculate offset
      const offset = (pageNumber - 1) * limitNumber;

      // Get total count for pagination metadata
      const totalCount = await em.count(Definitions, finalFilters);

      // Get definitions with pagination
      const definitions = await em.find(Definitions, finalFilters, {
        populate: ['asset', 'protocol', 'asset.chain'],
        orderBy: { _id: 1 },
        limit: limitNumber,
        offset: offset
      });
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limitNumber);
      const hasNextPage = pageNumber < totalPages;
      const hasPrevPage = pageNumber > 1;

      res.json({
        definitions,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNumber
        }
      });
    } catch (error) {
      console.error("Error fetching definitions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const em = this.orm.em.fork();

      const definitions = await em.findOne(Definitions, id, {
        populate: ['asset']
      });

      if (!definitions) {
        return res.status(404).json({ error: "Definitions not found" });
      }

      res.json(definitions);
    } catch (error) {
      console.error("Error fetching definitions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getByAssetId = async (req: Request, res: Response) => {
    try {
      const { assetId, protocol } = req.params;
      console.log({ assetId, protocol });

      const em = this.orm.em.fork();

      const protocolEntity = await em.findOne(Protocol, { name: new RegExp(protocol, "i") });

      if (!protocolEntity) {
        throw new Error("Protocol not found");
      }

      const definitions = await em.findOne(Definitions,
        { asset: assetId, protocol: protocolEntity },
        { populate: ['asset', 'protocol'] }
      );

      if (!definitions) {
        return res.status(404).json({ error: "Definitions not found for this asset" });
      }

      res.json(definitions);
    } catch (error) {
      console.error("Error fetching definitions by asset:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getByChainAndProtocol = async (req: Request, res: Response) => {
    try {
      const { chainId, protocolId } = req.query;

      if (!chainId || !protocolId) {
        return res.status(400).json({
          error: "Missing required query parameters: chainId, protocolId"
        });
      }

      const em = this.orm.em.fork();

      // First, find all assets matching the chain and protocol
      const assets = await em.find(Asset, {
        chain: chainId,
      }, {
        populate: ['chain']
      });

      if (assets.length === 0) {
        return res.json({ definitions: [] });
      }

      // Get asset IDs
      const assetIds = assets.map(asset => asset._id);

      // Find all definitions for these assets
      const definitions = await em.find(Definitions, {
        asset: { $in: assetIds }
      }, {
        populate: ['asset', 'asset.chain']
      });

      res.json({ definitions });
    } catch (error) {
      console.error("Error fetching definitions by chain and protocol:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { assetId, apy, withdraw, deposit, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri } = req.body;

      if (!assetId || !apy || !withdraw || !deposit) {
        return res.status(400).json({
          error: "Missing required fields: assetId, apy, withdraw, deposit"
        });
      }

      const em = this.orm.em.fork();

      const definitions = await em.findOne(Definitions, id);
      if (!definitions) {
        return res.status(404).json({ error: "Definitions not found" });
      }

      // If assetId is being updated, check for existing definition on target asset
      if (assetId !== undefined && assetId !== definitions.asset._id?.toString()) {
        const asset = await em.findOne(Asset, assetId);
        if (!asset) {
          return res.status(404).json({ error: "Asset not found" });
        }

        const existingDefinition = await em.findOne(Definitions, { asset: assetId });
        if (existingDefinition) {
          return res.status(409).json({
            error: "Definition already exists",
            message: `A definition for this asset already exists. Only one definition per asset is allowed.`
          });
        }

        definitions.asset = asset;
      }

      if (apy !== undefined) definitions.apy = apy;
      if (withdraw !== undefined) definitions.withdraw = withdraw;
      if (deposit !== undefined) definitions.deposit = deposit;
      if (underlyingAsset !== undefined) definitions.underlyingAsset = underlyingAsset;
      if (yieldBearingToken !== undefined) definitions.yieldBearingToken = yieldBearingToken;
      if (withdrawContract !== undefined) definitions.withdrawContract = withdrawContract;
      if (withdrawUri !== undefined) definitions.withdrawUri = withdrawUri;

      await em.persistAndFlush(definitions);

      res.json(definitions);
    } catch (error) {
      console.error("Error updating definitions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const em = this.orm.em.fork();

      const definitions = await em.findOne(Definitions, id);
      if (!definitions) {
        return res.status(404).json({ error: "Definitions not found" });
      }

      await em.removeAndFlush(definitions);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting definitions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
