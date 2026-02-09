const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let Referencetable = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  parentCode: {
    type: String,
    default: "",
  },
  refer_child: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  child_Code: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    default: 0,
  },
  ust_value: {
    type: Number,
    default: 0,
  },
  rewardStatus: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: String,
    default: "",
  },
  rewardCurrency: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "inactive",
  },
});

module.exports = mongoose.model(
  "Referencetable",
  Referencetable,
  "Referencetable"
);
