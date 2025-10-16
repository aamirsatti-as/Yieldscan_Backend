import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Asset } from "./asset";
import { Protocol } from "./protocol";

@Entity({ tableName: "definitions" })
export class Definitions {
  @PrimaryKey()
  _id!: ObjectId;

  @ManyToOne(() => Asset)
  asset!: Asset;

  @ManyToOne(() => Protocol)
  protocol!: Protocol;

  @Property()
  apy!: string;

  @Property()
  withdraw!: string;

  @Property()
  deposit!: string;

  @Property()
  underlyingAsset!: string;

  @Property()
  yieldBearingToken!: string;

  @Property()
  withdrawContract!: string;

  @Property()
  withdrawUri!: string;

  constructor(asset: Asset, protocol: Protocol, apy: string, withdraw: string, deposit: string, underlyingAsset: string, yieldBearingToken: string, withdrawContract: string, withdrawUri: string) {
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
}
