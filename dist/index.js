"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("@mikro-orm/mongodb");
const cron_1 = __importDefault(require("./cron"));
const server_1 = __importDefault(require("./server"));
const mikro_orm_config_1 = __importDefault(require("./mikro-orm-config"));
mongodb_1.MikroORM.init(mikro_orm_config_1.default).then(async (orm) => {
    (0, cron_1.default)(orm);
    (0, server_1.default)(orm);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBOEM7QUFDOUMsa0RBQTZCO0FBQzdCLHNEQUFtQztBQUNuQywwRUFBZ0Q7QUFFaEQsa0JBQVEsQ0FBQyxJQUFJLENBQUMsMEJBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFFdkQsSUFBQSxjQUFPLEVBQUMsR0FBRyxDQUFDLENBQUM7SUFDYixJQUFBLGdCQUFXLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUEifQ==