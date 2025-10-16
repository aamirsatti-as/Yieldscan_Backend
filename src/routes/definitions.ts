import { Router } from "express";
import { MikroORM } from "@mikro-orm/core";
import { DefinitionsController } from "../controllers/definitions.controller";

export function createDefinitionsRoutes(orm: MikroORM): Router {
  const router = Router();
  const definitionsController = new DefinitionsController(orm);

  // Create new definitions
  router.post("/", definitionsController.create as any);

  // Get all definitions
  router.get("/", definitionsController.getAll as any);

  // Get definitions by chain and protocol
  router.get("/by-chain-protocol", definitionsController.getByChainAndProtocol as any);

  // Get definitions by ID
  router.get("/:id", definitionsController.getById as any);

  // Get definitions by asset ID
  router.get("/asset/:assetId/:protocol", definitionsController.getByAssetId as any);

  // Update definitions
  router.put("/:id", definitionsController.update as any);

  // Delete definitions
  router.delete("/:id", definitionsController.delete as any);

  return router;
}
