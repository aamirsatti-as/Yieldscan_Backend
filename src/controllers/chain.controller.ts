import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
import { Chain } from "../models/chain";
import { ObjectId } from "@mikro-orm/mongodb";
import path from "path";
import * as fs from "fs";

export class ChainController {
    private orm: MikroORM;

    constructor(orm: MikroORM) {
        this.orm = orm;
    }

    // Create a new chain
    create = async (req: Request, res: Response) => {
        try {
            if (req.file) {
                req.body.image = `/chains/${req.file.filename}`;
            }
            const { name, chainId, image } = req.body;

            // Validate required fields
            if (!name || !chainId || !image === undefined) {
                return res.status(400).json({
                    error: "Missing required fields",
                    required: ["name", "chainId", "image", "decimals"]
                });
            }

            // Check if chain with same chainId already exists
            const existingChain = await this.orm.em.findOne(Chain, { chainId });
            if (existingChain) {
                return res.status(400).json({
                    error: "Chain with this chainId already exists"
                });
            }

            const chain = new Chain(name, chainId, image);
            await this.orm.em.persistAndFlush(chain);

            res.status(201).json({
                message: "Chain created successfully",
                chain
            });
        } catch (error) {
            console.error("Error creating chain:", error);
            res.status(500).json({
                error: "Failed to create chain",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get all chains
    getAll = async (req: Request, res: Response) => {
        try {
            const { name, page = 1, limit = 10 } = req.query;

            // Parse pagination parameters
            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const offset = (pageNum - 1) * limitNum;

            // Validate pagination parameters
            if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
                });
            }

            const filters: any = {};
            if (name) filters.name = new RegExp(name as string, 'i');

            // Get total count for pagination metadata
            const totalCount = await this.orm.em.count(Chain, filters);

            // Get paginated chains
            const chains = await this.orm.em.find(Chain, filters, {
                orderBy: { chainId: "asc" },
                limit: limitNum,
                offset: offset
            });

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / limitNum);
            const hasNextPage = pageNum < totalPages;
            const hasPrevPage = pageNum > 1;

            res.json({
                chains,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage
                }
            });
        } catch (error) {
            console.error("Error fetching chains:", error);
            res.status(500).json({
                error: "Failed to fetch chains",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get chain by ID
    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid chain ID format"
                });
            }

            const chain = await this.orm.em.findOne(Chain, { _id: new ObjectId(id) });

            if (!chain) {
                return res.status(404).json({
                    error: "Chain not found"
                });
            }

            res.json({ chain });
        } catch (error) {
            console.error("Error fetching chain:", error);
            res.status(500).json({
                error: "Failed to fetch chain",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get chain by chainId
    getByChainId = async (req: Request, res: Response) => {
        try {
            const { chainId } = req.params;

            const chainIdNum = parseInt(chainId);
            if (isNaN(chainIdNum)) {
                return res.status(400).json({
                    error: "Invalid chainId format - must be a number"
                });
            }

            const chain = await this.orm.em.findOne(Chain, { chainId: chainIdNum });

            if (!chain) {
                return res.status(404).json({
                    error: "Chain not found"
                });
            }

            res.json({ chain });
        } catch (error) {
            console.error("Error fetching chain by chainId:", error);
            res.status(500).json({
                error: "Failed to fetch chain",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Update chain
    update = async (req: Request, res: Response) => {
        try {
            if (req.file) {
                req.body.image = `/chains/${req.file.filename}`;
            }
            const { id } = req.params;
            const { name, chainId, image } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid chain ID format"
                });
            }

            const chain = await this.orm.em.findOne(Chain, { _id: new ObjectId(id) });

            if (!chain) {
                return res.status(404).json({
                    error: "Chain not found"
                });
            }

            // If updating chainId, check for conflicts
            if (chainId && chainId !== chain.chainId) {
                const existingChain = await this.orm.em.findOne(Chain, { chainId });
                if (existingChain) {
                    return res.status(400).json({
                        error: "Chain with this chainId already exists"
                    });
                }
                chain.chainId = chainId;
            }

            // Update fields if provided
            if (name !== undefined) chain.name = name;
            //delete old image
            if (chain.image && image !== undefined) {
                const oldImagePath = path.join(__dirname, '../../public', chain.image);
                fs.unlink(oldImagePath, (err: NodeJS.ErrnoException | null) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    } else {
                        console.log("Old image deleted:", oldImagePath);
                    }
                });

            }
            if (image !== undefined) chain.image = image;
            // if (decimals !== undefined) chain.decimals = decimals;

            await this.orm.em.flush();

            res.json({
                message: "Chain updated successfully",
                chain
            });
        } catch (error) {
            console.error("Error updating chain:", error);
            res.status(500).json({
                error: "Failed to update chain",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Delete chain
    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid chain ID format"
                });
            }

            const chain = await this.orm.em.findOne(Chain, { _id: new ObjectId(id) });

            if (!chain) {
                return res.status(404).json({
                    error: "Chain not found"
                });
            }
            if (chain.image) {
                const oldImagePath = path.join(__dirname, '../../public', chain.image);
                fs.unlink(oldImagePath, (err: NodeJS.ErrnoException | null) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    } else {
                        console.log("Old image deleted:", oldImagePath);
                    }
                });

            }
            await this.orm.em.removeAndFlush(chain);

            res.json({
                message: "Chain deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting chain:", error);
            res.status(500).json({
                error: "Failed to delete chain",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };
} 