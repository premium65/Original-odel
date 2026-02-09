import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const loginHistorySchema = new Schema({
  userId: {
    type: ObjectId,
    ref: "users",
  },
  countryCode: {
    type: String,
    default: "",
  },
  countryName: {
    type: String,
    default: "",
  },
  regionName: {
    type: String,
    default: "",
  },
  loginType: {
    type: String,
    default: "user",
  },
  adminId: {
    type: ObjectId,
    default: "admins",
  },
  ipaddress: {
    type: String,
    default: "",
  },
  broswername: {
    type: String,
    default: "",
  },
  ismobile: {
    type: String,
    default: "",
  },
  os: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "Success", // success / failure
  },
  reason: {
    type: String,
    default: "", // success / failure
  },
  createdDate: {
    type: Date,
    default: Date.now, // success / failure
  },
})

const loginHistoryModel = mongoose.model(
  "loginHistoryModel",
  loginHistorySchema,
  "loginHistoryModel"
)
export default loginHistoryModel
