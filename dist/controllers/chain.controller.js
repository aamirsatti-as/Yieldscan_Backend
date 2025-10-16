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
exports.ChainController = void 0;
const chain_1 = require("../models/chain");
const mongodb_1 = require("@mikro-orm/mongodb");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
class ChainController {
    constructor(orm) {
        // Create a new chain
        this.create = async (req, res) => {
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
                const existingChain = await this.orm.em.findOne(chain_1.Chain, { chainId });
                if (existingChain) {
                    return res.status(400).json({
                        error: "Chain with this chainId already exists"
                    });
                }
                const chain = new chain_1.Chain(name, chainId, image);
                await this.orm.em.persistAndFlush(chain);
                res.status(201).json({
                    message: "Chain created successfully",
                    chain
                });
            }
            catch (error) {
                console.error("Error creating chain:", error);
                res.status(500).json({
                    error: "Failed to create chain",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get all chains
        this.getAll = async (req, res) => {
            try {
                const { name, page = 1, limit = 10 } = req.query;
                // Parse pagination parameters
                const pageNum = parseInt(page, 10);
                const limitNum = parseInt(limit, 10);
                const offset = (pageNum - 1) * limitNum;
                // Validate pagination parameters
                if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
                    return res.status(400).json({
                        error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
                    });
                }
                const filters = {};
                if (name)
                    filters.name = new RegExp(name, 'i');
                // Get total count for pagination metadata
                const totalCount = await this.orm.em.count(chain_1.Chain, filters);
                // Get paginated chains
                const chains = await this.orm.em.find(chain_1.Chain, filters, {
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
            }
            catch (error) {
                console.error("Error fetching chains:", error);
                res.status(500).json({
                    error: "Failed to fetch chains",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get chain by ID
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid chain ID format"
                    });
                }
                const chain = await this.orm.em.findOne(chain_1.Chain, { _id: new mongodb_1.ObjectId(id) });
                if (!chain) {
                    return res.status(404).json({
                        error: "Chain not found"
                    });
                }
                res.json({ chain });
            }
            catch (error) {
                console.error("Error fetching chain:", error);
                res.status(500).json({
                    error: "Failed to fetch chain",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Get chain by chainId
        this.getByChainId = async (req, res) => {
            try {
                const { chainId } = req.params;
                const chainIdNum = parseInt(chainId);
                if (isNaN(chainIdNum)) {
                    return res.status(400).json({
                        error: "Invalid chainId format - must be a number"
                    });
                }
                const chain = await this.orm.em.findOne(chain_1.Chain, { chainId: chainIdNum });
                if (!chain) {
                    return res.status(404).json({
                        error: "Chain not found"
                    });
                }
                res.json({ chain });
            }
            catch (error) {
                console.error("Error fetching chain by chainId:", error);
                res.status(500).json({
                    error: "Failed to fetch chain",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Update chain
        this.update = async (req, res) => {
            try {
                if (req.file) {
                    req.body.image = `/chains/${req.file.filename}`;
                }
                const { id } = req.params;
                const { name, chainId, image } = req.body;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid chain ID format"
                    });
                }
                const chain = await this.orm.em.findOne(chain_1.Chain, { _id: new mongodb_1.ObjectId(id) });
                if (!chain) {
                    return res.status(404).json({
                        error: "Chain not found"
                    });
                }
                // If updating chainId, check for conflicts
                if (chainId && chainId !== chain.chainId) {
                    const existingChain = await this.orm.em.findOne(chain_1.Chain, { chainId });
                    if (existingChain) {
                        return res.status(400).json({
                            error: "Chain with this chainId already exists"
                        });
                    }
                    chain.chainId = chainId;
                }
                // Update fields if provided
                if (name !== undefined)
                    chain.name = name;
                //delete old image
                if (chain.image && image !== undefined) {
                    const oldImagePath = path_1.default.join(__dirname, '../../public', chain.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Error deleting old image:", err);
                        }
                        else {
                            console.log("Old image deleted:", oldImagePath);
                        }
                    });
                }
                if (image !== undefined)
                    chain.image = image;
                // if (decimals !== undefined) chain.decimals = decimals;
                await this.orm.em.flush();
                res.json({
                    message: "Chain updated successfully",
                    chain
                });
            }
            catch (error) {
                console.error("Error updating chain:", error);
                res.status(500).json({
                    error: "Failed to update chain",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        // Delete chain
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        error: "Invalid chain ID format"
                    });
                }
                const chain = await this.orm.em.findOne(chain_1.Chain, { _id: new mongodb_1.ObjectId(id) });
                if (!chain) {
                    return res.status(404).json({
                        error: "Chain not found"
                    });
                }
                if (chain.image) {
                    const oldImagePath = path_1.default.join(__dirname, '../../public', chain.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Error deleting old image:", err);
                        }
                        else {
                            console.log("Old image deleted:", oldImagePath);
                        }
                    });
                }
                await this.orm.em.removeAndFlush(chain);
                res.json({
                    message: "Chain deleted successfully"
                });
            }
            catch (error) {
                console.error("Error deleting chain:", error);
                res.status(500).json({
                    error: "Failed to delete chain",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        };
        this.orm = orm;
    }
}
exports.ChainController = ChainController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVycy9jaGFpbi5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDJDQUF3QztBQUN4QyxnREFBOEM7QUFDOUMsZ0RBQXdCO0FBQ3hCLHVDQUF5QjtBQUV6QixNQUFhLGVBQWU7SUFHeEIsWUFBWSxHQUFhO1FBSXpCLHFCQUFxQjtRQUNyQixXQUFNLEdBQUcsS0FBSyxFQUFFLEdBQVksRUFBRSxHQUFhLEVBQUUsRUFBRTtZQUMzQyxJQUFJLENBQUM7Z0JBQ0QsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNwRCxDQUFDO2dCQUNELE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBRTFDLDJCQUEyQjtnQkFDM0IsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDNUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDeEIsS0FBSyxFQUFFLHlCQUF5Qjt3QkFDaEMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDO3FCQUNyRCxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFFRCxrREFBa0Q7Z0JBQ2xELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFD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