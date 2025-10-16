import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
import { Protocol } from "../models/protocol";
import { ObjectId } from "@mikro-orm/mongodb";
import path from "path";
import * as fs from "fs";
export class ProtocolController {
    private orm: MikroORM;

    constructor(orm: MikroORM) {
        this.orm = orm;
    }

    // Create a new protocol
    create = async (req: Request, res: Response) => {
        try {
            if (req.file) {
                req.body.image = `/protocols/${req.file.filename}`;
            }
            const { name, website, image } = req.body;

            // Validate required fields
            if (!name || !image) {
                return res.status(400).json({
                    error: "Missing required fields",
                    required: ["name", "image"]
                });
            }

            const protocol = new Protocol(name, image, website);
            await this.orm.em.persistAndFlush(protocol);

            res.status(201).json({
                message: "Protocol created successfully",
                protocol
            });
        } catch (error) {
            console.error('Error creating protocol:', error);
            res.status(500).json({
                error: "Failed to create protocol",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get all protocols
    getAll = async (req: Request, res: Response) => {
        try {
            const { name, page, limit } = req.query;

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
            if (name) filters.name = new RegExp(name as string, 'i');

            // Calculate offset
            const offset = (pageNumber - 1) * limitNumber;

            // Get total count for pagination metadata
            const totalCount = await this.orm.em.count(Protocol, filters);

            // Get protocols with pagination
            const protocols = await this.orm.em.find(Protocol, filters, {
                orderBy: { name: 1 },
                limit: limitNumber,
                offset: offset
            });

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            res.json({
                protocols,
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
            console.error('Error fetching protocols:', error);
            res.status(500).json({
                error: "Failed to fetch protocols",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get protocol by ID
    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid protocol ID format"
                });
            }

            const protocol = await this.orm.em.findOne(Protocol, { _id: new ObjectId(id) });

            if (!protocol) {
                return res.status(404).json({
                    error: "Protocol not found"
                });
            }

            res.json({ protocol });
        } catch (error) {
            console.error('Error fetching protocol:', error);
            res.status(500).json({
                error: "Failed to fetch protocol",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Get protocol by name
    getByName = async (req: Request, res: Response) => {
        try {
            const { name } = req.params;

            const protocol = await this.orm.em.findOne(Protocol, {
                name: new RegExp(`^${name}$`, 'i')
            });

            if (!protocol) {
                return res.status(404).json({
                    error: "Protocol not found"
                });
            }

            res.json({ protocol });
        } catch (error) {
            console.error('Error fetching protocol by name:', error);
            res.status(500).json({
                error: "Failed to fetch protocol",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Update protocol
    update = async (req: Request, res: Response) => {
        try {
            if (req.file) {
                req.body.image = `/protocols/${req.file.filename}`;
            }
            const { id } = req.params;
            const { name, website, image } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid protocol ID format"
                });
            }

            const protocol = await this.orm.em.findOne(Protocol, { _id: new ObjectId(id) });

            if (!protocol) {
                return res.status(404).json({
                    error: "Protocol not found"
                });
            }

            // Update fields if provided
            if (name !== undefined) protocol.name = name;
            //delete old image
            if (protocol.image !== undefined) {
                const oldImagePath = path.join(__dirname, '..', '..', 'public', protocol.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting old image:', err);
                    }
                });
            }
            if (image !== undefined) protocol.image = image;
            if (website !== undefined) protocol.website = website;

            await this.orm.em.flush();

            res.json({
                message: "Protocol updated successfully",
                protocol
            });
        } catch (error) {
            console.error('Error updating protocol:', error);
            res.status(500).json({
                error: "Failed to update protocol",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Delete protocol
    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    error: "Invalid protocol ID format"
                });
            }

            const protocol = await this.orm.em.findOne(Protocol, { _id: new ObjectId(id) });

            if (!protocol) {
                return res.status(404).json({
                    error: "Protocol not found"
                });
            }
            if (protocol.image !== undefined) {
                const oldImagePath = path.join(__dirname, '..', '..', 'public', protocol.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting old image:', err);
                    }
                });
            }
            await this.orm.em.removeAndFlush(protocol);

            res.json({
                message: "Protocol deleted successfully"
            });
        } catch (error) {
            console.error('Error deleting protocol:', error);
            res.status(500).json({
                error: "Failed to delete protocol",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    };
} 