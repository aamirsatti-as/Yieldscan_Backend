import  { Router } from "express";
import { AssetController } from "../controllers/asset.controller";
import { MikroORM } from "@mikro-orm/core";
import createUploadMiddleware from "../middleware/multer";

export function createAssetRoutes(orm: MikroORM): Router {
    const router = Router();
    const assetController = new AssetController(orm);
    const upload = createUploadMiddleware('assets');

    // Asset CRUD routes
    router.post("/",upload.single('file'), assetController.create as any);
    router.get("/", assetController.getAll as any);
    router.get("/address/:address", assetController.getByAddress as any);
    router.get("/:id", assetController.getById as any);
    router.put("/:id",upload.single('file'), assetController.update as any);
    router.delete("/:id", assetController.delete as any);

    return router;
} 
