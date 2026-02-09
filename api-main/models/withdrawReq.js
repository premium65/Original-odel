// import package
import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const withdrawReqSchema = new Schema(
  {
    userCode: {
      type: String,
      required: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    adminSeqNo: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    rec: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "new",
    },
    reason: {
      type: String,
      default: "",
    },
    bankDetails: {
      bankName: {
        type: String,
        default: "",
      },
      accountNo: {
        type: String,
        default: "",
      },
      phoneNo: {
        type: Number,
        default: "",
      },
      holderName: {
        type: String,
        default: "",
      },
      UPI: {
        type: String,
        default: "",
      },
      IFSC: {
        type: String,
        default: "",
      },
      countryCode: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
)

const WithdrawReq = mongoose.model(
  "withdrawReq",
  withdrawReqSchema,
  "withdrawReq"
)

export default WithdrawReq
