import { Router } from "express";
import { ProtocolController } from "../controllers/protocol.controller";
import { MikroORM } from "@mikro-orm/core";
import createUploadMiddleware from "../middleware/multer";

export function createProtocolRoutes(orm: MikroORM): Router {
    const router = Router();
    const protocolController = new ProtocolController(orm);
    const upload = createUploadMiddleware("protocols");

    // Protocol CRUD routes
    router.post("/",upload.single('file'), protocolController.create as any);
    router.get("/", protocolController.getAll as any);
    router.get("/name/:name", protocolController.getByName as any);
    router.get("/:id", protocolController.getById as any);
    router.put("/:id", upload.single('file'),protocolController.update as any);
    router.delete("/:id", protocolController.delete as any);

    return router;
} 