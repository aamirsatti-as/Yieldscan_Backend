import { Router } from "express";
import path from "path";

export function createBackofficeRoutes(): Router {
  const router = Router();

  // Backoffice main page
  router.get("/", (_req, res) => {
    console.log("📍 /backoffice route hit");
    res.sendFile(path.join(process.cwd(), 'public/assets-list.html'));
  });

  // Assets list page
  router.get("/assets", (_req, res) => {
    console.log("📍 /backoffice/assets route hit");
    res.sendFile(path.join(process.cwd(), 'public/assets-list.html'));
  });

  // Asset detail page
  router.get("/assets/:assetId", (_req, res) => {
    console.log("📍 /backoffice/assets/:assetId route hit");
    res.sendFile(path.join(process.cwd(), 'public/asset-detail.html'));
  });

  // Chains list page
  router.get("/chains", (_req, res) => {
    console.log("📍 /backoffice/chains route hit");
    res.sendFile(path.join(process.cwd(), 'public/chains-list.html'));
  });

  // Chain detail page
  router.get("/chains/:chainId", (_req, res) => {
    console.log("📍 /backoffice/chains/:chainId route hit");
    res.sendFile(path.join(process.cwd(), 'public/chain-detail.html'));
  });

  // Protocols list page
  router.get("/protocols", (_req, res) => {
    console.log("📍 /backoffice/protocols route hit");
    res.sendFile(path.join(process.cwd(), 'public/protocols-list.html'));
  });

  // Protocol detail page
  router.get("/protocols/:protocolId", (_req, res) => {
    console.log("📍 /backoffice/protocols/:protocolId route hit");
    res.sendFile(path.join(process.cwd(), 'public/protocol-detail.html'));
  });

  return router;
} 