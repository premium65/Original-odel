import mongoose from "mongoose"

const ObjectId = mongoose.Schema.Types.ObjectId

const BonusSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    userCode: {
      type: String,
      required: true,
    },
    adminSeqNo: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    userStatus: {
      type: String,
      default: "new",
    },
    taskCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const Bonus = mongoose.model("bonus", BonusSchema, "bonus")

export default Bonus
