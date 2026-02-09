// import package
import mongoose from "mongoose";

const Schema = mongoose.Schema;

let referralfee = new Schema({
  percentage: {
    type: String,
  },
  currencyId: {
    type: Schema.Types.ObjectId,
    index: true,
  },
  usdtamount: {
    type: String,
  },

  createdDate: {
    type: Date,
    default: new Date(),
  },
  currencySymbol: {
    type: String,
    default: "", // 0 - deactive, 1-active
  },
  status: {
    type: String,
    default: 1, // 0 - deactive, 1-active
  },
});

const referralFeeDetail = mongoose.model("referralfee", referralfee, "referralfee");

export default referralFeeDetail;
