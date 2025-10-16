import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
import { Asset } from "../models/asset";
import { Chain } from "../models/chain";
import { ObjectId } from "@mikro-orm/mongodb";
import { Definitions } from "../models/definitions";
import * as fs from 'fs'
import path from "path";
export class AssetController {
    private orm: MikroORM;

    constructor(orm: MikroORM) {
        this.orm = orm;
    }

    // Create a new asset
    create = async (req: Request, res: Response) => {
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
            const chain = await em.findOne(Chain, chainId);
            if (!chain) {
                return res.status(404).json({ error: "Chain not found" });
            }

            // Check for duplicate asset (same symbol, address, chain, and protocol)
            const existingAsset = await em.findOne(Asset, {
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

            const asset = new Asset(symbol, image, address, chain, decimals, maxDecimalsShow);
            await em.persistAndFlush(asset);

            res.status(201).json({
                message: "Asset created successfully",
                asset
            });
        } catch (error) {
            console.error("Error creating asset:", error);
            res.status(500).json({
                error: "Failed to create asset",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get all assets with optional filtering
    getAll = async (req: Request, res: Response) => {
        try {
            const { chainId, symbol, page, limit } = req.query;

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

            const filters: any = {};

            if (chainId) filters.chain = chainId;
            if (symbol) filters.symbol = new RegExp(symbol as string, 'i');

            // Calculate offset
            const offset = (pageNumber - 1) * limitNumber;

            // Get total count for pagination metadata
            const totalCount = await this.orm.em.count(Asset, filters);

            // Get assets with pagination
            const assets = await this.orm.em.find(Asset, filters, {
                populate: ['chain'],
                orderBy: { symbol: 1 },
                limit: limitNumber,
                offset: offset
            });
            const assetIds = assets.map(a => a._id);
            const definitions = await this.orm.em.find(Definitions, { asset: { $in: assetIds } }, {
                populate: ['protocol'],
            });

            // group by assetId
            const defsByAsset = definitions.reduce((acc, def) => {
                const assetId = def.asset._id.toString();
                if (!acc[assetId]) acc[assetId] = [];
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
            }, {} as Record<string, any[]>);

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
        } catch (error) {
            console.error("Error fetching assets:", error);
            res.status(500).json({
                error: "Failed to fetch assets",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get asset by ID
    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid asset ID format"
                });
            }

            const asset = await this.orm.em.findOne(Asset, { _id: new ObjectId(id) }, {
                populate: ['chain']
            });

            if (!asset) {
                return res.status(404).json({
                    error: "Asset not found"
                });
            }

            res.json({ asset });
        } catch (error) {
            console.error("Error fetching asset:", error);
            res.status(500).json({
                error: "Failed to fetch asset",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get asset by address
    getByAddress = async (req: Request, res: Response) => {
        try {
            const { address } = req.params;
            const { chainId } = req.query;

            const filters: any = { address: new RegExp(address, 'i') };

            if (chainId) filters.chain = chainId;

            const asset = await this.orm.em.findOne(Asset, filters, {
                populate: ['chain']
            });

            if (!asset) {
                return res.status(404).json({
                    error: "Asset not found"
                });
            }

            res.json({ asset });
        } catch (error) {
            console.error("Error fetching asset by address:", error);
            res.status(500).json({
                error: "Failed to fetch asset",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Update asset
    update = async (req: Request, res: Response) => {
        try {
            if (req.file) {
                req.body.image = `/assets/${req.file.filename}`;
            }
            const { id } = req.params;
            const { symbol, image, address, chainId, decimals, maxDecimalsShow } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid asset ID format"
                });
            }

            const em = this.orm.em.fork();
            const asset = await em.findOne(Asset, { _id: new ObjectId(id) });

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
                const chain = await em.findOne(Chain, chainId);
                if (!chain) {
                    return res.status(404).json({ error: "Chain not found" });
                }
                updatedChainId = chain;
            }

            // Check for duplicate asset (excluding current asset)
            const existingAsset = await em.findOne(Asset, {
                symbol: updatedSymbol,
                address: updatedAddress,
                chain: updatedChainId,
                decimals: asset.decimals,
                _id: { $ne: new ObjectId(id) } // Exclude current asset
            });

            if (existingAsset) {
                return res.status(409).json({
                    error: "Asset already exists",
                    message: `An asset with symbol "${updatedSymbol}", address "${updatedAddress}", on this chain and protocol already exists`
                });
            }

            // Update fields if provided
            if (symbol !== undefined) asset.symbol = symbol;
            //delete old image
            if (asset.image && image !== undefined) {
                const oldImagePath = path.join(__dirname, `../../public${asset.image}`);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    }
                });
            }
            if (image !== undefined) asset.image = image;
            if (address !== undefined) asset.address = address;
            if (chainId !== undefined) asset.chain = updatedChainId;
            if (decimals !== undefined) asset.decimals = decimals;
            if (maxDecimalsShow !== undefined) asset.maxDecimalsShow = updatedMaxDecimalsShow;
            await em.flush();

            res.json({
                message: "Asset updated successfully",
                asset
            });
        } catch (error) {
            console.error("Error updating asset:", error);
            res.status(500).json({
                error: "Failed to update asset",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Delete asset
    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid asset ID format"
                });
            }

            const asset = await this.orm.em.findOne(Asset, { _id: new ObjectId(id) });

            if (!asset) {
                return res.status(404).json({
                    error: "Asset not found"
                });
            }
            if (asset.image) {
                const oldImagePath = path.join(__dirname, `../../public${asset.image}`);
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
        } catch (error) {
            console.error("Error deleting asset:", error);
            res.status(500).json({
                error: "Failed to delete asset",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };
} 