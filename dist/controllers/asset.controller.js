"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const asset_1 = require("../models/asset");
const chain_1 = require("../models/chain");
const mongodb_1 = require("@mikro-orm/mongodb");
const definitions_1 = require("../models/definitions");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
class AssetController {
    constructor(orm) {
        // Create a new asset
        this.create = async (req, res) => {
            try {
                if (req.file) {
                    req.body.image = `/assets/${req.file.filename}`;
                }
                const { symbol, image, address, decimals, chainId, maxDecimalsShow } = req.body;
                // Validate required fields
                if (!symbol || !image || !address || !decimals || !chainId || !maxDecimalsShow) {
                    return res.status(400).json({
                        error: "Missing required fields",
                        required: ["symbol", "image", "address", "chainId", "maxDecimalsShow"]
                    });
                }
                const em = this.orm.em.fork();
                // Check if chain exists
                const chain = await em.findOne(chain_1.Chain, chainId);
                if (!chain) {
                    return res.status(404).json({ error: "Chain not found" });
                }
                // Check for duplicate asset (same symbol, address, chain, and protocol)
                const existingAsset = await em.findOne(asset_1.Asset, {
                    symbol: symbol,
                    address: address,
                    chain: chainId,
                    decimals: decimals
                });
                if (existingAsset) {
                    return res.status(409).json({
                        error: "Asset already exists",
                        message: `An asset with symbol "${symbol}", address "${address}", on this chain and protocol already exists`
                    });
                }
                const asset = new asset_1.Asset(symbol, image, address, chain, decimals, maxDecimalsShow);
                await em.persistAndFlush(asset);
                res.status(201).json({
                    message: "Asset created successfully",
                    asset
                });
            }
            catch (error) {
                console.error("Error creating asset:", error);
                res.status(500).json({
                    error: "Failed to create asset",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get all assets with optional filtering
        this.getAll = async (req, res) => {
            try {
                const { chainId, symbol, page, limit } = req.query;
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
                const filters = {};
                if (chainId)
                    filters.chain = chainId;
                if (symbol)
                    filters.symbol = new RegExp(symbol, 'i');
                // Calculate offset
                const offset = (pageNumber - 1) * limitNumber;
                // Get total count for pagination metadata
                const totalCount = await this.orm.em.count(asset_1.Asset, filters);
                // Get assets with pagination
                const assets = await this.orm.em.find(asset_1.Asset, filters, {
                    populate: ['chain'],
                    orderBy: { symbol: 1 },
                    limit: limitNumber,
                    offset: offset
                });
                const assetIds = assets.map(a => a._id);
                const definitions = await this.orm.em.find(definitions_1.Definitions, { asset: { $in: assetIds } }, {
                    populate: ['protocol'],
                });
                // group by assetId
                const defsByAsset = definitions.reduce((acc, def) => {
                    const assetId = def.asset._id.toString();
                    if (!acc[assetId])
                        acc[assetId] = [];
                    acc[assetId].push({
                        id: def._id.toString(),
                        asset: def.asset._id.toString(),
                        protocol: {
                            id: def.protocol._id.toString(),
                            name: def.protocol.name,
                            website: def.protocol.website,
                            image: def.protocol.image,
                        },
                        apy: def.apy,
                        deposit: def.deposit,
                        withdraw: def.withdraw,
                        underlyingAsset: def.underlyingAsset,
                        yieldBearingToken: def.yieldBearingToken,
                        withdrawContract: def.withdrawContract,
                        withdrawUri: def.withdrawUri
                    });
                    return acc;
                }, {});
                // final combined response
                const result = assets.map(asset => ({
                    id: asset._id.toString(),
                    symbol: asset.symbol,
                    image: asset.image,
                    address: asset.address,
                    decimals: asset.decimals,
                    maxDecimalsShow: asset.maxDecimalsShow,
                    usdPrice: asset.usdPrice,
                    chain: {
                        id: asset?.chain?._id?.toString(),
                        name: asset?.chain?.name,
                        chainId: asset?.chain?.chainId,
                        image: asset?.chain?.image,
                    },
                    definitions: defsByAsset[asset._id.toString()] || [],
                }));
                // Calculate pagination metadata
                const totalPages = Math.ceil(totalCount / limitNumber);
                const hasNextPage = pageNumber < totalPages;
                const hasPrevPage = pageNumber > 1;
                res.json({
                    assets: result,
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
                console.error("Error fetching assets:", error);
                res.status(500).json({
                    error: "Failed to fetch assets",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get asset by ID
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid asset ID format"
                    });
                }
                const asset = await this.orm.em.findOne(asset_1.Asset, { _id: new mongodb_1.ObjectId(id) }, {
                    populate: ['chain']
                });
                if (!asset) {
                    return res.status(404).json({
                        error: "Asset not found"
                    });
                }
                res.json({ asset });
            }
            catch (error) {
                console.error("Error fetching asset:", error);
                res.status(500).json({
                    error: "Failed to fetch asset",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get asset by address
        this.getByAddress = async (req, res) => {
            try {
                const { address } = req.params;
                const { chainId } = req.query;
                const filters = { address: new RegExp(address, 'i') };
                if (chainId)
                    filters.chain = chainId;
                const asset = await this.orm.em.findOne(asset_1.Asset, filters, {
                    populate: ['chain']
                });
                if (!asset) {
                    return res.status(404).json({
                        error: "Asset not found"
                    });
                }
                res.json({ asset });
            }
            catch (error) {
                console.error("Error fetching asset by address:", error);
                res.status(500).json({
                    error: "Failed to fetch asset",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Update asset
        this.update = async (req, res) => {
            try {
                if (req.file) {
                    req.body.image = `/assets/${req.file.filename}`;
                }
                const { id } = req.params;
                const { symbol, image, address, chainId, decimals, maxDecimalsShow } = req.body;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid asset ID format"
                    });
                }
                const em = this.orm.em.fork();
                const asset = await em.findOne(asset_1.Asset, { _id: new mongodb_1.ObjectId(id) });
                if (!asset) {
                    return res.status(404).json({
                        error: "Asset not found"
                    });
                }
                // Prepare updated values for duplicate check
                const updatedSymbol = symbol !== undefined ? symbol : asset.symbol;
                const updatedAddress = address !== undefined ? address : asset.address;
                let updatedChainId = asset.chain;
                const updatedMaxDecimalsShow = maxDecimalsShow !== undefined ? maxDecimalsShow : asset.maxDecimalsShow;
                if (chainId !== undefined) {
                    const chain = await em.findOne(chain_1.Chain, chainId);
                    if (!chain) {
                        return res.status(404).json({ error: "Chain not found" });
                    }
                    updatedChainId = chain;
                }
                // Check for duplicate asset (excluding current asset)
                const existingAsset = await em.findOne(asset_1.Asset, {
                    symbol: updatedSymbol,
                    address: updatedAddress,
                    chain: updatedChainId,
                    decimals: asset.decimals,
                    _id: { $ne: new mongodb_1.ObjectId(id) } // Exclude current asset
                });
                if (existingAsset) {
                    return res.status(409).json({
                        error: "Asset already exists",
                        message: `An asset with symbol "${updatedSymbol}", address "${updatedAddress}", on this chain and protocol already exists`
                    });
                }
                // Update fields if provided
                if (symbol !== undefined)
                    asset.symbol = symbol;
                //delete old image
                if (asset.image && image !== undefined) {
                    const oldImagePath = path_1.default.join(__dirname, `../../public${asset.image}`);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Error deleting old image:", err);
                        }
                    });
                }
                if (image !== undefined)
                    asset.image = image;
                if (address !== undefined)
                    asset.address = address;
                if (chainId !== undefined)
                    asset.chain = updatedChainId;
                if (decimals !== undefined)
                    asset.decimals = decimals;
                if (maxDecimalsShow !== undefined)
                    asset.maxDecimalsShow = updatedMaxDecimalsShow;
                await em.flush();
                res.json({
                    message: "Asset updated successfully",
                    asset
                });
            }
            catch (error) {
                console.error("Error updating asset:", error);
                res.status(500).json({
                    error: "Failed to update asset",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Delete asset
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid asset ID format"
                    });
                }
                const asset = await this.orm.em.findOne(asset_1.Asset, { _id: new mongodb_1.ObjectId(id) });
                if (!asset) {
                    return res.status(404).json({
                        error: "Asset not found"
                    });
                }
                if (asset.image) {
                    const oldImagePath = path_1.default.join(__dirname, `../../public${asset.image}`);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Error deleting old image:", err);
                        }
                    });
                }
                await this.orm.em.removeAndFlush(asset);
                res.json({
                    message: "Asset deleted successfully"
                });
            }
            catch (error) {
                console.error("Error deleting asset:", error);
                res.status(500).json({
                    error: "Failed to delete asset",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        this.orm = orm;
    }
}
exports.AssetController = AssetController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVycy9hc3NldC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDJDQUF3QztBQUN4QywyQ0FBd0M7QUFDeEMsZ0RBQThDO0FBQzlDLHVEQUFvRDtBQUNwRCx1Q0FBd0I7QUFDeEIsZ0RBQXdCO0FBQ3hCLE1BQWEsZUFBZTtJQUd4QixZQUFZLEdBQWE7UUFJekIscUJBQXFCO1FBQ3JCLFdBQU0sR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQzNDLElBQUksQ0FBQztnQkFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BELENBQUM7Z0JBQ0QsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFFaEYsMkJBQTJCO2dCQUMzQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQzdFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLEtBQUssRUFBRSx5QkFBeUI7d0JBQ2hDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQztxQkFDekUsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBRUQs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