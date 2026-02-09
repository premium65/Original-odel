const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let ReferralReward = new Schema({
    refertalTableId: {
        type: Schema.Types.ObjectId,
        ref: "Referencetable",
    },
    tradeId: {
        type: Schema.Types.ObjectId,
    },
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
    rewardCurrency: {
        type: String,
        default: "",
    },

});

module.exports = mongoose.model(
    "referralReward",
    ReferralReward,
    "referralReward"
);
