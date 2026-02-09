// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let depositHistorySchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DepositHistory = mongoose.model(
  "depositHistory",
 depositHistorySchema,
  "depositHistory"
);
export default DepositHistory;
