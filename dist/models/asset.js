"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const core_1 = require("@mikro-orm/core");
const mongodb_1 = require("@mikro-orm/mongodb");
const chain_1 = require("./chain");
let Asset = class Asset {
    constructor(symbol, image, address, chain, decimals, maxDecimalsShow) {
        this.symbol = symbol;
        this.image = image;
        this.address = address;
        this.decimals = decimals;
        this.maxDecimalsShow = maxDecimalsShow;
        this.chain = chain;
    }
};
exports.Asset = Asset;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", mongodb_1.ObjectId)
], Asset.prototype, "_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Asset.prototype, "symbol", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Asset.prototype, "image", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Asset.prototype, "address", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], Asset.prototype, "decimals", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => chain_1.Chain),
    __metadata("design:type", chain_1.Chain)
], Asset.prototype, "chain", void 0);
__decorate([
    (0, core_1.Property)({ default: 0 }),
    __metadata("design:type", Number)
], Asset.prototype, "usdPrice", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], Asset.prototype, "maxDecimalsShow", void 0);
exports.Asset = Asset = __decorate([
    (0, core_1.Entity)({ tableName: "assets" }),
    __metadata("design:paramtypes", [String, String, String, chain_1.Chain, Number, Number])
], Asset);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL2Fzc2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUEwRTtBQUMxRSxnREFBOEM7QUFDOUMsbUNBQWdDO0FBR3pCLElBQU0sS0FBSyxHQUFYLE1BQU0sS0FBSztJQXlCZCxZQUFZLE1BQWMsRUFBRSxLQUFhLEVBQUUsT0FBZSxFQUFFLEtBQVksRUFBRSxRQUFnQixFQUFFLGVBQXVCO1FBQy9HLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSixDQUFBO0FBakNZLHNCQUFLO0FBRWQ7SUFEQyxJQUFBLGlCQUFVLEdBQUU7OEJBQ1Asa0JBQVE7a0NBQUM7QUFHZjtJQURDLElBQUEsZUFBUSxHQUFFOztxQ0FDSztBQUdoQjtJQURDLElBQUEsZUFBUSxHQUFFOztvQ0FDSTtBQUdmO0lBREMsSUFBQSxlQUFRLEdBQUU7O3NDQUNNO0FBR2pCO0lBREMsSUFBQSxlQUFRLEdBQUU7O3VDQUNPO0FBR2xCO0lBREMsSUFBQSxnQkFBUyxFQUFDLEdBQUcsRUFBRSxDQUFDLGFBQUssQ0FBQzs4QkFDZixhQUFLO29DQUFDO0FBR2Q7SUFEQyxJQUFBLGVBQVEsRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7dUNBQ1I7QUFHakI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7OENBQ2E7Z0JBdkJmLEtBQUs7SUFEakIsSUFBQSxhQUFNLEVBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUM7NkRBMEJ1QyxhQUFLO0dBekIvRCxLQUFLLENBaUNqQiJ9