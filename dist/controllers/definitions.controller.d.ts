import { MikroORM } from "@mikro-orm/core";
import { Request, Response } from "express";
export declare class DefinitionsController {
    private orm;
    constructor(orm: MikroORM);
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getByAssetId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getByChainAndProtocol: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    delete: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=definitions.controller.d.ts.map