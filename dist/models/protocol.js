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
exports.Protocol = void 0;
const core_1 = require("@mikro-orm/core");
const mongodb_1 = require("@mikro-orm/mongodb");
let Protocol = class Protocol {
    constructor(name, image, website) {
        this.name = name;
        this.image = image;
        this.website = website;
    }
};
exports.Protocol = Protocol;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", mongodb_1.ObjectId)
], Protocol.prototype, "_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Protocol.prototype, "name", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Protocol.prototype, "website", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Protocol.prototype, "image", void 0);
exports.Protocol = Protocol = __decorate([
    (0, core_1.Entity)({ tableName: "protocols" }),
    __metadata("design:paramtypes", [String, String, String])
], Protocol);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL3Byb3RvY29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUErRDtBQUMvRCxnREFBOEM7QUFHdkMsSUFBTSxRQUFRLEdBQWQsTUFBTSxRQUFRO0lBYWpCLFlBQVksSUFBWSxFQUFFLEtBQWEsRUFBRSxPQUFnQjtRQUNyRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0NBQ0osQ0FBQTtBQWxCWSw0QkFBUTtBQUVqQjtJQURDLElBQUEsaUJBQVUsR0FBRTs4QkFDUCxrQkFBUTtxQ0FBQztBQUdmO0lBREMsSUFBQSxlQUFRLEdBQUU7O3NDQUNHO0FBR2Q7SUFEQyxJQUFBLGVBQVEsRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7eUNBQ1o7QUFHakI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7dUNBQ0k7bUJBWE4sUUFBUTtJQURwQixJQUFBLGFBQU0sRUFBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsQ0FBQzs7R0FDdEIsUUFBUSxDQWtCcEIifQ==