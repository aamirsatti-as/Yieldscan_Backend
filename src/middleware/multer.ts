import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Allowed MIME types and their extensions
const FILE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

// File filter to validate type
const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (FILE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

/**
 * Creates a Multer middleware instance with a subfolder
 * @param subfolder - subdirectory under /public to store files (e.g., 'images', 'pdfs')
 */
const createUploadMiddleware = (subfolder = ""): multer.Multer => {
  const uploadPath = path.join(__dirname, "../..", "public", subfolder);

  // Ensure the target directory exists
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const safeName = baseName.replace(/\s+/g, "_").toLowerCase();
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${safeName}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter,
  });
};

export default createUploadMiddleware;
