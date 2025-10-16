"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetRoutes = createAssetRoutes;
const express_1 = require("express");
const asset_controller_1 = require("../controllers/asset.controller");
const multer_1 = __importDefault(require("../middleware/multer"));
function createAssetRoutes(orm) {
    const router = (0, express_1.Router)();
    const assetController = new asset_controller_1.AssetController(orm);
    const upload = (0, multer_1.default)('assets');
    // Asset CRUD routes
    router.post("/", upload.single('file'), assetController.create);
    router.get("/", assetController.getAll);
    router.get("/address/:address", assetController.getByAddress);
    router.get("/:id", assetController.getById);
    router.put("/:id", upload.single('file'), assetController.update);
    router.delete("/:id", assetController.delete);
    return router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9hc3NldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSw4Q0FjQztBQW5CRCxxQ0FBa0M7QUFDbEMsc0VBQWtFO0FBRWxFLGtFQUEwRDtBQUUxRCxTQUFnQixpQkFBaUIsQ0FBQyxHQUFhO0lBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQU0sR0FBRSxDQUFDO0lBQ3hCLE1BQU0sZUFBZSxHQUFHLElBQUksa0NBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGdCQUFzQixFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhELG9CQUFvQjtJQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGVBQWUsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUN0RSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsTUFBYSxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUMsWUFBbUIsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxPQUFjLENBQUMsQ0FBQztJQUNuRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGVBQWUsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUN4RSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsTUFBYSxDQUFDLENBQUM7SUFFckQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyJ9