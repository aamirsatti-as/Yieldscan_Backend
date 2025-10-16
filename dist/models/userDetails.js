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
exports.UserDetails = void 0;
const core_1 = require("@mikro-orm/core");
const mongodb_1 = require("@mikro-orm/mongodb");
let UserDetails = class UserDetails {
    constructor(walletAddress, ethLastBlock, bscLastBlock, arbLastBlock, data) {
        this.walletAddress = walletAddress;
        this.ethLastBlock = ethLastBlock;
        this.bscLastBlock = bscLastBlock;
        this.arbLastBlock = arbLastBlock;
        this.data = data;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.UserDetails = UserDetails;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", mongodb_1.ObjectId)
], UserDetails.prototype, "_id", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], UserDetails.prototype, "walletAddress", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], UserDetails.prototype, "ethLastBlock", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], UserDetails.prototype, "bscLastBlock", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], UserDetails.prototype, "arbLastBlock", void 0);
__decorate([
    (0, core_1.Property)({ type: 'json' }),
    __metadata("design:type", Object)
], UserDetails.prototype, "data", void 0);
__decorate([
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Date)
], UserDetails.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], UserDetails.prototype, "updatedAt", void 0);
exports.UserDetails = UserDetails = __decorate([
    (0, core_1.Entity)({ tableName: "user-details" }),
    __metadata("design:paramtypes", [String, String, String, String, Object])
], UserDetails);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRldGFpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL3VzZXJEZXRhaWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUErRDtBQUMvRCxnREFBOEM7QUFHdkMsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBVztJQXlCcEIsWUFBWSxhQUFxQixFQUFFLFlBQW9CLEVBQUUsWUFBb0IsRUFBRSxZQUFvQixFQUFFLElBQXlCO1FBQzFILElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDaEMsQ0FBQztDQUNKLENBQUE7QUFsQ1ksa0NBQVc7QUFFcEI7SUFEQyxJQUFBLGlCQUFVLEdBQUU7OEJBQ1Asa0JBQVE7d0NBQUM7QUFHZjtJQURDLElBQUEsZUFBUSxFQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDOztrREFDSjtBQUd2QjtJQURDLElBQUEsZUFBUSxHQUFFOztpREFDVztBQUd0QjtJQURDLElBQUEsZUFBUSxHQUFFOztpREFDVztBQUd0QjtJQURDLElBQUEsZUFBUSxHQUFFOztpREFDVztBQUd0QjtJQURDLElBQUEsZUFBUSxFQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDOzt5Q0FDQTtBQUczQjtJQURDLElBQUEsZUFBUSxFQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQzs4QkFDOUIsSUFBSTs4Q0FBQztBQUdoQjtJQURDLElBQUEsZUFBUSxFQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQzs4QkFDOUIsSUFBSTs4Q0FBQztzQkF2QlAsV0FBVztJQUR2QixJQUFBLGFBQU0sRUFBQyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsQ0FBQzs7R0FDekIsV0FBVyxDQWtDdkIifQ==