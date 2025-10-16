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
exports.Definitions = void 0;
const core_1 = require("@mikro-orm/core");
const mongodb_1 = require("@mikro-orm/mongodb");
const asset_1 = require("./asset");
const protocol_1 = require("./protocol");
let Definitions = class Definitions {
    constructor(asset, protocol, apy, withdraw, deposit, underlyingAsset, yieldBearingToken, withdrawContract, withdrawUri) {
        this.asset = asset;
        this.protocol = protocol;
        this.apy = apy;
        this.withdraw = withdraw;
        this.deposit = deposit;
        this.underlyingAsset = underlyingAsset;
        this.yieldBearingToken = yieldBearingToken;
        this.withdrawContract = withdrawContract;
        this.withdrawUri = withdrawUri;
    }
};
exports.Definitions = Definitions;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", mongodb_1.ObjectId)
], Definitions.prototype, "_id", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => asset_1.Asset),
    __metadata("design:type", asset_1.Asset)
], Definitions.prototype, "asset", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => protocol_1.Protocol),
    __metadata("design:type", protocol_1.Protocol)
], Definitions.prototype, "protocol", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "apy", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "withdraw", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "deposit", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "underlyingAsset", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "yieldBearingToken", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "withdrawContract", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Definitions.prototype, "withdrawUri", void 0);
exports.Definitions = Definitions = __decorate([
    (0, core_1.Entity)({ tableName: "definitions" }),
    __metadata("design:paramtypes", [asset_1.Asset, protocol_1.Protocol, String, String, String, String, String, String, String])
], Definitions);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL2RlZmluaXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUEwRTtBQUMxRSxnREFBOEM7QUFDOUMsbUNBQWdDO0FBQ2hDLHlDQUFzQztBQUcvQixJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXO0lBK0J0QixZQUFZLEtBQVksRUFBRSxRQUFrQixFQUFFLEdBQVcsRUFBRSxRQUFnQixFQUFFLE9BQWUsRUFBRSxlQUF1QixFQUFFLGlCQUF5QixFQUFFLGdCQUF3QixFQUFFLFdBQW1CO1FBQzdMLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0NBQ0YsQ0FBQTtBQTFDWSxrQ0FBVztBQUV0QjtJQURDLElBQUEsaUJBQVUsR0FBRTs4QkFDUCxrQkFBUTt3Q0FBQztBQUdmO0lBREMsSUFBQSxnQkFBUyxFQUFDLEdBQUcsRUFBRSxDQUFDLGFBQUssQ0FBQzs4QkFDZixhQUFLOzBDQUFDO0FBR2Q7SUFEQyxJQUFBLGdCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsbUJBQVEsQ0FBQzs4QkFDZixtQkFBUTs2Q0FBQztBQUdwQjtJQURDLElBQUEsZUFBUSxHQUFFOzt3Q0FDRTtBQUdiO0lBREMsSUFBQSxlQUFRLEdBQUU7OzZDQUNPO0FBR2xCO0lBREMsSUFBQSxlQUFRLEdBQUU7OzRDQUNNO0FBR2pCO0lBREMsSUFBQSxlQUFRLEdBQUU7O29EQUNjO0FBR3pCO0lBREMsSUFBQSxlQUFRLEdBQUU7O3NEQUNnQjtBQUczQjtJQURDLElBQUEsZUFBUSxHQUFFOztxREFDZTtBQUcxQjtJQURDLElBQUEsZUFBUSxHQUFFOztnREFDVTtzQkE3QlYsV0FBVztJQUR2QixJQUFBLGFBQU0sRUFBQyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQztxQ0FnQ2hCLGFBQUssRUFBWSxtQkFBUTtHQS9CakMsV0FBVyxDQTBDdkIifQ==