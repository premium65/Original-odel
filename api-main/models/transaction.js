// import package
import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const transactionSchema = new Schema(
  {
    userId: {
      type: ObjectId, // Ref. to user collection _id
      required: true,
      ref: "user",
    },
    adminSeqNo: {
      type: Number,
    },
    type: {
      type: String,
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      default: "pending",
    },
    reason: {
      type: String,
      default: "",
    },
    tableId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Transaction = mongoose.model(
  "transactions",
  transactionSchema,
  "transactions"
)

export default Transaction
