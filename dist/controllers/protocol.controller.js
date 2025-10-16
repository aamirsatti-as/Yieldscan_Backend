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
exports.ProtocolController = void 0;
const protocol_1 = require("../models/protocol");
const mongodb_1 = require("@mikro-orm/mongodb");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
class ProtocolController {
    constructor(orm) {
        // Create a new protocol
        this.create = async (req, res) => {
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
                const protocol = new protocol_1.Protocol(name, image, website);
                await this.orm.em.persistAndFlush(protocol);
                res.status(201).json({
                    message: "Protocol created successfully",
                    protocol
                });
            }
            catch (error) {
                console.error('Error creating protocol:', error);
                res.status(500).json({
                    error: "Failed to create protocol",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get all protocols
        this.getAll = async (req, res) => {
            try {
                const { name, page, limit } = req.query;
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
                if (name)
                    filters.name = new RegExp(name, 'i');
                // Calculate offset
                const offset = (pageNumber - 1) * limitNumber;
                // Get total count for pagination metadata
                const totalCount = await this.orm.em.count(protocol_1.Protocol, filters);
                // Get protocols with pagination
                const protocols = await this.orm.em.find(protocol_1.Protocol, filters, {
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
            }
            catch (error) {
                console.error('Error fetching protocols:', error);
                res.status(500).json({
                    error: "Failed to fetch protocols",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get protocol by ID
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid protocol ID format"
                    });
                }
                const protocol = await this.orm.em.findOne(protocol_1.Protocol, { _id: new mongodb_1.ObjectId(id) });
                if (!protocol) {
                    return res.status(404).json({
                        error: "Protocol not found"
                    });
                }
                res.json({ protocol });
            }
            catch (error) {
                console.error('Error fetching protocol:', error);
                res.status(500).json({
                    error: "Failed to fetch protocol",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get protocol by name
        this.getByName = async (req, res) => {
            try {
                const { name } = req.params;
                const protocol = await this.orm.em.findOne(protocol_1.Protocol, {
                    name: new RegExp(`^${name}$`, 'i')
                });
                if (!protocol) {
                    return res.status(404).json({
                        error: "Protocol not found"
                    });
                }
                res.json({ protocol });
            }
            catch (error) {
                console.error('Error fetching protocol by name:', error);
                res.status(500).json({
                    error: "Failed to fetch protocol",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Update protocol
        this.update = async (req, res) => {
            try {
                if (req.file) {
                    req.body.image = `/protocols/${req.file.filename}`;
                }
                const { id } = req.params;
                const { name, website, image } = req.body;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid protocol ID format"
                    });
                }
                const protocol = await this.orm.em.findOne(protocol_1.Protocol, { _id: new mongodb_1.ObjectId(id) });
                if (!protocol) {
                    return res.status(404).json({
                        error: "Protocol not found"
                    });
                }
                // Update fields if provided
                if (name !== undefined)
                    protocol.name = name;
                //delete old image
                if (protocol.image !== undefined) {
                    const oldImagePath = path_1.default.join(__dirname, '..', '..', 'public', protocol.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error('Error deleting old image:', err);
                        }
                    });
                }
                if (image !== undefined)
                    protocol.image = image;
                if (website !== undefined)
                    protocol.website = website;
                await this.orm.em.flush();
                res.json({
                    message: "Protocol updated successfully",
                    protocol
                });
            }
            catch (error) {
                console.error('Error updating protocol:', error);
                res.status(500).json({
                    error: "Failed to update protocol",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Delete protocol
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid protocol ID format"
                    });
                }
                const protocol = await this.orm.em.findOne(protocol_1.Protocol, { _id: new mongodb_1.ObjectId(id) });
                if (!protocol) {
                    return res.status(404).json({
                        error: "Protocol not found"
                    });
                }
                if (protocol.image !== undefined) {
                    const oldImagePath = path_1.default.join(__dirname, '..', '..', 'public', protocol.image);
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
            }
            catch (error) {
                console.error('Error deleting protocol:', error);
                res.status(500).json({
                    error: "Failed to delete protocol",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        this.orm = orm;
    }
}
exports.ProtocolController = ProtocolController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2wuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVycy9wcm90b2NvbC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLGlEQUE4QztBQUM5QyxnREFBOEM7QUFDOUMsZ0RBQXdCO0FBQ3hCLHVDQUF5QjtBQUN6QixNQUFhLGtCQUFrQjtJQUczQixZQUFZLEdBQWE7UUFJekIsd0JBQXdCO1FBQ3hCLFdBQU0sR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQzNDLElBQUksQ0FBQztnQkFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3ZELENBQUM7Z0JBQ0QsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFFMUMsMkJBQTJCO2dCQUMzQixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2xCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLEtBQUssRUFBRSx5QkFBeUI7d0JBQ2hDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7cUJBQzlCLENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUVELE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFNUMs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