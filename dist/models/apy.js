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
exports.Apy = void 0;
const core_1 = require("@mikro-orm/core");
const mongodb_1 = require("@mikro-orm/mongodb");
let Apy = class Apy {
    constructor(type, tokenAddress, apy, borrowApy, rewardApy) {
        this.createdAt = new Date();
        this.type = type;
        this.tokenAddress = tokenAddress;
        this.apy = apy;
        this.borrowApy = borrowApy;
        this.rewardApy = rewardApy;
    }
};
exports.Apy = Apy;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", mongodb_1.ObjectId)
], Apy.prototype, "_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Apy.prototype, "type", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Apy.prototype, "tokenAddress", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Apy.prototype, "apy", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Apy.prototype, "borrowApy", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Apy.prototype, "rewardApy", void 0);
__decorate([
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Date)
], Apy.prototype, "createdAt", void 0);
exports.Apy = Apy = __decorate([
    (0, core_1.Entity)({ tableName: "apy" }),
    __metadata("design:paramtypes", [String, String, String, String, String])
], Apy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXB5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9hcHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMENBQStEO0FBQy9ELGdEQUE4QztBQUd2QyxJQUFNLEdBQUcsR0FBVCxNQUFNLEdBQUc7SUFzQlosWUFBWSxJQUFZLEVBQUUsWUFBb0IsRUFBRSxHQUFXLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUZqRyxjQUFTLEdBQVMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUd6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7Q0FDSixDQUFBO0FBN0JZLGtCQUFHO0FBRVo7SUFEQyxJQUFBLGlCQUFVLEdBQUU7OEJBQ1Asa0JBQVE7Z0NBQUM7QUFHZjtJQURDLElBQUEsZUFBUSxHQUFFOztpQ0FDRztBQUdkO0lBREMsSUFBQSxlQUFRLEdBQUU7O3lDQUNXO0FBR3RCO0lBREMsSUFBQSxlQUFRLEdBQUU7O2dDQUNFO0FBR2I7SUFEQyxJQUFBLGVBQVEsR0FBRTs7c0NBQ1E7QUFHbkI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7c0NBQ1E7QUFHbkI7SUFEQyxJQUFBLGVBQVEsRUFBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFFLENBQUM7OEJBQzlCLElBQUk7c0NBQWM7Y0FwQnBCLEdBQUc7SUFEZixJQUFBLGFBQU0sRUFBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7R0FDaEIsR0FBRyxDQTZCZiJ9