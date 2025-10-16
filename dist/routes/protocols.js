"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProtocolRoutes = createProtocolRoutes;
const express_1 = require("express");
const protocol_controller_1 = require("../controllers/protocol.controller");
const multer_1 = __importDefault(require("../middleware/multer"));
function createProtocolRoutes(orm) {
    const router = (0, express_1.Router)();
    const protocolController = new protocol_controller_1.ProtocolController(orm);
    const upload = (0, multer_1.default)("protocols");
    // Protocol CRUD routes
    router.post("/", upload.single('file'), protocolController.create);
    router.get("/", protocolController.getAll);
    router.get("/name/:name", protocolController.getByName);
    router.get("/:id", protocolController.getById);
    router.put("/:id", upload.single('file'), protocolController.update);
    router.delete("/:id", protocolController.delete);
    return router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9wcm90b2NvbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxvREFjQztBQW5CRCxxQ0FBaUM7QUFDakMsNEVBQXdFO0FBRXhFLGtFQUEwRDtBQUUxRCxTQUFnQixvQkFBb0IsQ0FBQyxHQUFhO0lBQzlDLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQU0sR0FBRSxDQUFDO0lBQ3hCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSx3Q0FBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFBLGdCQUFzQixFQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRW5ELHVCQUF1QjtJQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGtCQUFrQixDQUFDLE1BQWEsQ0FBQyxDQUFDO0lBQ3pFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLE1BQWEsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLFNBQWdCLENBQUMsQ0FBQztJQUMvRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxPQUFjLENBQUMsQ0FBQztJQUN0RCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLGtCQUFrQixDQUFDLE1BQWEsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQWEsQ0FBQyxDQUFDO0lBRXhELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMifQ==