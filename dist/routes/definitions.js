"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefinitionsRoutes = createDefinitionsRoutes;
const express_1 = require("express");
const definitions_controller_1 = require("../controllers/definitions.controller");
function createDefinitionsRoutes(orm) {
    const router = (0, express_1.Router)();
    const definitionsController = new definitions_controller_1.DefinitionsController(orm);
    // Create new definitions
    router.post("/", definitionsController.create);
    // Get all definitions
    router.get("/", definitionsController.getAll);
    // Get definitions by chain and protocol
    router.get("/by-chain-protocol", definitionsController.getByChainAndProtocol);
    // Get definitions by ID
    router.get("/:id", definitionsController.getById);
    // Get definitions by asset ID
    router.get("/asset/:assetId/:protocol", definitionsController.getByAssetId);
    // Update definitions
    router.put("/:id", definitionsController.update);
    // Delete definitions
    router.delete("/:id", definitionsController.delete);
    return router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL2RlZmluaXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsMERBMEJDO0FBOUJELHFDQUFpQztBQUVqQyxrRkFBOEU7QUFFOUUsU0FBZ0IsdUJBQXVCLENBQUMsR0FBYTtJQUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGdCQUFNLEdBQUUsQ0FBQztJQUN4QixNQUFNLHFCQUFxQixHQUFHLElBQUksOENBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFN0QseUJBQXlCO0lBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLE1BQWEsQ0FBQyxDQUFDO0lBRXRELHNCQUFzQjtJQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUVyRCx3Q0FBd0M7SUFDeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxxQkFBcUIsQ0FBQyxxQkFBNEIsQ0FBQyxDQUFDO0lBRXJGLHdCQUF3QjtJQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxPQUFjLENBQUMsQ0FBQztJQUV6RCw4QkFBOEI7SUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxxQkFBcUIsQ0FBQyxZQUFtQixDQUFDLENBQUM7SUFFbkYscUJBQXFCO0lBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLHFCQUFxQixDQUFDLE1BQWEsQ0FBQyxDQUFDO0lBRXhELHFCQUFxQjtJQUNyQixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUUzRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIn0=