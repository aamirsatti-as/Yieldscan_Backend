import multer from "multer";
/**
 * Creates a Multer middleware instance with a subfolder
 * @param subfolder - subdirectory under /public to store files (e.g., 'images', 'pdfs')
 */
declare const createUploadMiddleware: (subfolder?: string) => multer.Multer;
export default createUploadMiddleware;
//# sourceMappingURL=multer.d.ts.map