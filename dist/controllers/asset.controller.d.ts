import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
export declare class AssetController {
    private orm;
    constructor(orm: MikroORM);
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getByAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    delete: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=asset.controller.d.ts.map