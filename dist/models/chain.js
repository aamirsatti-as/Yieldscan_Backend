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
exports.Chain = void 0;
const core_1 = require("@mikro-orm/core");
const mongodb_1 = require("@mikro-orm/mongodb");
let Chain = class Chain {
    constructor(name, chainId, image) {
        this.name = name;
        this.chainId = chainId;
        this.image = image;
    }
};
exports.Chain = Chain;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", mongodb_1.ObjectId)
], Chain.prototype, "_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Chain.prototype, "name", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", Number)
], Chain.prototype, "chainId", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Chain.prototype, "image", void 0);
exports.Chain = Chain = __decorate([
    (0, core_1.Entity)({ tableName: "chains" }),
    __metadata("design:paramtypes", [String, Number, String])
], Chain);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL2NoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUErRDtBQUMvRCxnREFBOEM7QUFHdkMsSUFBTSxLQUFLLEdBQVgsTUFBTSxLQUFLO0lBYWQsWUFDSSxJQUFZLEVBQ1osT0FBZSxFQUNmLEtBQWE7UUFFYixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0NBQ0osQ0FBQTtBQXRCWSxzQkFBSztBQUVkO0lBREMsSUFBQSxpQkFBVSxHQUFFOzhCQUNQLGtCQUFRO2tDQUFDO0FBR2Y7SUFEQyxJQUFBLGVBQVEsR0FBRTs7bUNBQ0c7QUFHZDtJQURDLElBQUEsZUFBUSxFQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDOztzQ0FDVjtBQUdqQjtJQURDLElBQUEsZUFBUSxHQUFFOztvQ0FDSTtnQkFYTixLQUFLO0lBRGpCLElBQUEsYUFBTSxFQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDOztHQUNuQixLQUFLLENBc0JqQiJ9