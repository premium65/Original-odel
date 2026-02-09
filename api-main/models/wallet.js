// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const walletSchema = new Schema(
  {
    _id: {
      type: ObjectId, // Ref. to user collection _id
      required: true,
      ref: "user",
    },
    userCode: {
      type: String,
      unique: true,
      required: true,
    },
    level: {
      type: String,
    },
    levelBonus: {
      type: Number,
    },
    totalBalance: {
      type: Number,
    },
    todayCommission: {
      type: Number,
    },
    totalCommission: {
      type: Number,
    },
    pendingAmount: {
      type: Number,
    },
    totalWithdraw: {
      type: Number,
      default: 0,
    },
    totalDeposit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Wallet = mongoose.model("wallet", walletSchema, "wallet");

export default Wallet;
