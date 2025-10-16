"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChainRoutes = createChainRoutes;
const express_1 = require("express");
const chain_controller_1 = require("../controllers/chain.controller");
const multer_1 = __importDefault(require("../middleware/multer"));
function createChainRoutes(orm) {
    const router = (0, express_1.Router)();
    const chainController = new chain_controller_1.ChainController(orm);
    const upload = (0, multer_1.default)("chains");
    // Chain CRUD routes
    router.post("/", upload.single('file'), chainController.create);
    router.get("/", chainController.getAll);
    router.get("/chainId/:chainId", chainController.getByChainId);
    router.get("/:id", chainController.getById);
    router.put("/:id", upload.single('file'), chainController.update);
    router.delete("/:id", chainController.delete);
    return router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9jaGFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSw4Q0FjQztBQW5CRCxxQ0FBaUM7QUFDakMsc0VBQWtFO0FBRWxFLGtFQUEwRDtBQUUxRCxTQUFnQixpQkFBaUIsQ0FBQyxHQUFhO0lBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQU0sR0FBRSxDQUFDO0lBQ3hCLE1BQU0sZUFBZSxHQUFHLElBQUksa0NBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGdCQUFzQixFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhELG9CQUFvQjtJQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGVBQWUsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUN0RSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsTUFBYSxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUMsWUFBbUIsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxPQUFjLENBQUMsQ0FBQztJQUNuRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGVBQWUsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUN6RSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsTUFBYSxDQUFDLENBQUM7SUFFckQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyJ9