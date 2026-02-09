// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const passBookSchema = new Schema({
  userId: {
    // type: ObjectId,
    type: String,
    ref: "user",
  },
  userCodeId: {
    type: String,
    default: "",
  },
  //   coin: {
  //     type: String,
  //     default: "",
  //   },
  //   currencyId: {
  //     type: ObjectId,
  //     ref: "currency",
  //   },
  tableId: {
    type: String,
  },
  beforeBalance: {
    type: Number,
    default: 0,
  },
  afterBalance: {
    type: Number,
    default: 0,
  },
  pendingBalanceBefore: {
    type: Number,
    default: 0,
  },
  pendingBalanceAfter: {
    type: Number,
    default: 0,
  },
  todayCommissionBefore: {
    type: Number,
    default: 0,
  },
  todayCommissionAfter: {
    type: Number,
    default: 0,
  },
  totalCommission: { type: Number, default: 0 },
  amount: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    // enum: ['coin_deposit', 'coin_withdraw',"fiat_deposit","fiat_withdraw","fiat_transfer","coin_transfer"],
    default: "",
  },
  category: {
    type: String,
    enum: ["credit", "debit"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("passbook", passBookSchema, "passbook");
