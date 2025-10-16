import { Router } from "express";
import { ChainController } from "../controllers/chain.controller";
import { MikroORM } from "@mikro-orm/core";
import createUploadMiddleware from "../middleware/multer";

export function createChainRoutes(orm: MikroORM): Router {
    const router = Router();
    const chainController = new ChainController(orm);
    const upload = createUploadMiddleware("chains");

    // Chain CRUD routes
    router.post("/",upload.single('file'), chainController.create as any);
    router.get("/", chainController.getAll as any);
    router.get("/chainId/:chainId", chainController.getByChainId as any);
    router.get("/:id", chainController.getById as any);
    router.put("/:id", upload.single('file'), chainController.update as any);
    router.delete("/:id", chainController.delete as any);

    return router;
} 