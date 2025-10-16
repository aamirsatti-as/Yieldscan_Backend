"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Allowed MIME types and their extensions
const FILE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "application/pdf": "pdf",
};
// File filter to validate type
const fileFilter = (_, file, cb) => {
    if (FILE_TYPES[file.mimetype]) {
        cb(null, true);
    }
    else {
        cb(new Error("Unsupported file type"));
    }
};
/**
 * Creates a Multer middleware instance with a subfolder
 * @param subfolder - subdirectory under /public to store files (e.g., 'images', 'pdfs')
 */
const createUploadMiddleware = (subfolder = "") => {
    const uploadPath = path_1.default.join(__dirname, "../..", "public", subfolder);
    // Ensure the target directory exists
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            const baseName = path_1.default.basename(file.originalname, ext);
            const safeName = baseName.replace(/\s+/g, "_").toLowerCase();
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, `${safeName}-${uniqueSuffix}${ext}`);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB
        },
        fileFilter,
    });
};
exports.default = createUploadMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvbXVsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQW9EO0FBQ3BELGdEQUF3QjtBQUN4Qiw0Q0FBb0I7QUFHcEIsMENBQTBDO0FBQzFDLE1BQU0sVUFBVSxHQUEyQjtJQUN6QyxZQUFZLEVBQUUsS0FBSztJQUNuQixXQUFXLEVBQUUsS0FBSztJQUNsQixXQUFXLEVBQUUsS0FBSztJQUNsQixpQkFBaUIsRUFBRSxLQUFLO0NBQ3pCLENBQUM7QUFFRiwrQkFBK0I7QUFDL0IsTUFBTSxVQUFVLEdBQUcsQ0FDakIsQ0FBVSxFQUNWLElBQXlCLEVBQ3pCLEVBQXNCLEVBQ2hCLEVBQUU7SUFDUixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUM5QixFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pCLENBQUM7U0FBTSxDQUFDO1FBQ04sRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQWlCLEVBQUU7SUFDL0QsTUFBTSxVQUFVLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUV0RSxxQ0FBcUM7SUFDckMsWUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUU5QyxNQUFNLE9BQU8sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztRQUNqQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUNELFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNUMsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDeEUsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLFFBQVEsSUFBSSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFBLGdCQUFNLEVBQUM7UUFDWixPQUFPO1FBQ1AsTUFBTSxFQUFFO1lBQ04sUUFBUSxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLE9BQU87U0FDbkM7UUFDRCxVQUFVO0tBQ1gsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsc0JBQXNCLENBQUMifQ==