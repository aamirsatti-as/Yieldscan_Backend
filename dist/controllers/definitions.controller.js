"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionsController = void 0;
const definitions_1 = require("../models/definitions");
const asset_1 = require("../models/asset");
const protocol_1 = require("../models/protocol");
class DefinitionsController {
    constructor(orm) {
        this.orm = orm;
        this.create = async (req, res) => {
            try {
                const { assetId, apy, withdraw, deposit, protocolId, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri } = req.body;
                if (!assetId || !apy || !withdraw || !deposit || !protocolId) {
                    return res.status(400).json({
                        error: "Missing required fields: assetId, apy, withdraw, deposit, protocolId"
                    });
                }
                const em = this.orm.em.fork();
                // Check if asset exists
                const asset = await em.findOne(asset_1.Asset, assetId);
                const protocol = await em.findOne(protocol_1.Protocol, protocolId);
                if (!asset) {
                    return res.status(404).json({ error: "Asset not found" });
                }
                if (!protocol) {
                    return res.status(404).json({ error: "Protocol not found" });
                }
                // Check if definition already exists for this asset
                const existingDefinition = await em.findOne(definitions_1.Definitions, { asset: assetId, protocol: protocol });
                if (existingDefinition) {
                    return res.status(409).json({
                        error: "Definition already exists",
                        message: `A definition for this asset already exists. Only one definition per asset is allowed.`
                    });
                }
                const definitions = new definitions_1.Definitions(asset, protocol, apy, withdraw, deposit, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri);
                await em.persistAndFlush(definitions);
                res.status(201).json(definitions);
            }
            catch (error) {
                console.error("Error creating definitions:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
        this.getAll = async (req, res) => {
            try {
                const { page, limit, search, assetId } = req.query;
                // Parse pagination parameters
                const pageNumber = parseInt(page) || 1;
                const limitNumber = parseInt(limit) || 10;
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
                const filters = {};
                // Asset filter
                if (assetId) {
                    filters.asset = assetId;
                }
                // Search filter - search by asset symbol
                let searchFilters = {};
                if (search) {
                    // We need to find assets that match the search term first
                    const matchingAssets = await em.find(asset_1.Asset, {
                        symbol: new RegExp(search, 'i')
                    });
                    if (matchingAssets.length > 0) {
                        const assetIds = matchingAssets.map(asset => asset._id);
                        searchFilters.asset = { $in: assetIds };
                    }
                    else {
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
                const totalCount = await em.count(definitions_1.Definitions, finalFilters);
                // Get definitions with pagination
                const definitions = await em.find(definitions_1.Definitions, finalFilters, {
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
            }
            catch (error) {
                console.error("Error fetching definitions:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                const em = this.orm.em.fork();
                const definitions = await em.findOne(definitions_1.Definitions, id, {
                    populate: ['asset']
                });
                if (!definitions) {
                    return res.status(404).json({ error: "Definitions not found" });
                }
                res.json(definitions);
            }
            catch (error) {
                console.error("Error fetching definitions:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
        this.getByAssetId = async (req, res) => {
            try {
                const { assetId, protocol } = req.params;
                console.log({ assetId, protocol });
                const em = this.orm.em.fork();
                const protocolEntity = await em.findOne(protocol_1.Protocol, { name: new RegExp(protocol, "i") });
                if (!protocolEntity) {
                    throw new Error("Protocol not found");
                }
                const definitions = await em.findOne(definitions_1.Definitions, { asset: assetId, protocol: protocolEntity }, { populate: ['asset', 'protocol'] });
                if (!definitions) {
                    return res.status(404).json({ error: "Definitions not found for this asset" });
                }
                res.json(definitions);
            }
            catch (error) {
                console.error("Error fetching definitions by asset:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
        this.getByChainAndProtocol = async (req, res) => {
            try {
                const { chainId, protocolId } = req.query;
                if (!chainId || !protocolId) {
                    return res.status(400).json({
                        error: "Missing required query parameters: chainId, protocolId"
                    });
                }
                const em = this.orm.em.fork();
                // First, find all assets matching the chain and protocol
                const assets = await em.find(asset_1.Asset, {
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
                const definitions = await em.find(definitions_1.Definitions, {
                    asset: { $in: assetIds }
                }, {
                    populate: ['asset', 'asset.chain']
                });
                res.json({ definitions });
            }
            catch (error) {
                console.error("Error fetching definitions by chain and protocol:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const { assetId, apy, withdraw, deposit, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri } = req.body;
                if (!assetId || !apy || !withdraw || !deposit) {
                    return res.status(400).json({
                        error: "Missing required fields: assetId, apy, withdraw, deposit"
                    });
                }
                const em = this.orm.em.fork();
                const definitions = await em.findOne(definitions_1.Definitions, id);
                if (!definitions) {
                    return res.status(404).json({ error: "Definitions not found" });
                }
                // If assetId is being updated, check for existing definition on target asset
                if (assetId !== undefined && assetId !== definitions.asset._id?.toString()) {
                    const asset = await em.findOne(asset_1.Asset, assetId);
                    if (!asset) {
                        return res.status(404).json({ error: "Asset not found" });
                    }
                    const existingDefinition = await em.findOne(definitions_1.Definitions, { asset: assetId });
                    if (existingDefinition) {
                        return res.status(409).json({
                            error: "Definition already exists",
                            message: `A definition for this asset already exists. Only one definition per asset is allowed.`
                        });
                    }
                    definitions.asset = asset;
                }
                if (apy !== undefined)
                    definitions.apy = apy;
                if (withdraw !== undefined)
                    definitions.withdraw = withdraw;
                if (deposit !== undefined)
                    definitions.deposit = deposit;
                if (underlyingAsset !== undefined)
                    definitions.underlyingAsset = underlyingAsset;
                if (yieldBearingToken !== undefined)
                    definitions.yieldBearingToken = yieldBearingToken;
                if (withdrawContract !== undefined)
                    definitions.withdrawContract = withdrawContract;
                if (withdrawUri !== undefined)
                    definitions.withdrawUri = withdrawUri;
                await em.persistAndFlush(definitions);
                res.json(definitions);
            }
            catch (error) {
                console.error("Error updating definitions:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                const em = this.orm.em.fork();
                const definitions = await em.findOne(definitions_1.Definitions, id);
                if (!definitions) {
                    return res.status(404).json({ error: "Definitions not found" });
                }
                await em.removeAndFlush(definitions);
                res.status(204).send();
            }
            catch (error) {
                console.error("Error deleting definitions:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        };
    }
}
exports.DefinitionsController = DefinitionsController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvbnMuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVycy9kZWZpbml0aW9ucy5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHVEQUFvRDtBQUNwRCwyQ0FBd0M7QUFDeEMsaURBQThDO0FBRTlDLE1BQWEscUJBQXFCO0lBQ2hDLFlBQW9CLEdBQWE7UUFBYixRQUFHLEdBQUgsR0FBRyxDQUFVO1FBRWpDLFdBQU0sR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQzdDLElBQUksQ0FBQztnQkFDSCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFFcEksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUM3RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUMxQixLQUFLLEVBQUUsc0VBQXNFO3FCQUM5RSxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFFRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFOUIsd0JBQXdCO2dCQUN4QixNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLEtBQUss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